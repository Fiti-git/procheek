import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/roles';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './password-reset.entity';
import { RefreshToken } from './refresh-token.entity';
import { TokenBlocklist } from './token-blocklist.entity';
import { MailService } from '../mail/mail.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  jti?: string;
}

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private users: UsersService,
    private config: ConfigService,
    private mail: MailService,
    @InjectRepository(PasswordReset) private readonly resets: Repository<PasswordReset>,
    @InjectRepository(RefreshToken) private readonly refresh: Repository<RefreshToken>,
    @InjectRepository(TokenBlocklist) private readonly blocklist: Repository<TokenBlocklist>,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user || !user.isActive) {
      return;
    }
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.resets.save(this.resets.create({ userId: user.id, tokenHash, expiresAt }));

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await this.mail.sendPasswordReset(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string) {
    if (newPassword.length < 8) throw new BadRequestException('New password too short');
    const tokenHash = this.hashToken(token);
    const record = await this.resets.findOne({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }
    await this.users.setPassword(record.userId, await bcrypt.hash(newPassword, 10));
    record.usedAt = new Date();
    await this.resets.save(record);

    await this.resets.createQueryBuilder()
      .update()
      .set({ usedAt: new Date() })
      .where('user_id = :uid AND used_at IS NULL', { uid: record.userId })
      .execute();

    return { ok: true };
  }

  private signAccessToken(user: { id: string; email: string; role: Role }): { token: string; jti: string } {
    const jti = randomUUID();
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, jti };
    const token = this.jwt.sign(payload, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
    return { token, jti };
  }

  private async issueRefreshToken(userId: string, meta: { userAgent?: string; ip?: string }) {
    const token = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    const row = await this.refresh.save(this.refresh.create({
      userId,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
    }));
    return { token, row };
  }

  async login(email: string, password: string, meta: { userAgent?: string; ip?: string } = {}) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.users.touchLastLogin(user.id);

    const { token: accessToken } = this.signAccessToken({ id: user.id, email: user.email, role: user.role });
    const { token: refreshToken } = await this.issueRefreshToken(user.id, meta);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        locale: user.locale,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async refreshTokens(refreshToken: string, meta: { userAgent?: string; ip?: string } = {}) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const tokenHash = this.hashToken(refreshToken);
    const record = await this.refresh.findOne({ where: { tokenHash } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(record.userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid refresh token');

    // Rotate.
    const { token: newRefresh, row: newRow } = await this.issueRefreshToken(user.id, meta);
    record.revokedAt = new Date();
    record.replacedById = newRow.id;
    await this.refresh.save(record);

    const { token: accessToken } = this.signAccessToken({ id: user.id, email: user.email, role: user.role });

    return {
      accessToken,
      refreshToken: newRefresh,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async logout(userId: string, jti: string | undefined, tokenExpSeconds: number | undefined, refreshToken?: string) {
    if (jti) {
      const expiresAt = tokenExpSeconds
        ? new Date(tokenExpSeconds * 1000)
        : new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
      try {
        await this.blocklist.save(this.blocklist.create({ jti, expiresAt }));
      } catch {
        // Unique conflict is fine.
      }
    }

    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      const rec = await this.refresh.findOne({ where: { tokenHash } });
      if (rec && rec.userId === userId && !rec.revokedAt) {
        rec.revokedAt = new Date();
        await this.refresh.save(rec);
      }
    } else {
      // Revoke all active refresh tokens for the user.
      await this.refresh.createQueryBuilder()
        .update()
        .set({ revokedAt: new Date() })
        .where('user_id = :uid AND revoked_at IS NULL', { uid: userId })
        .execute();
    }

    return { ok: true };
  }

  async isJtiBlocked(jti: string): Promise<boolean> {
    if (!jti) return false;
    const row = await this.blocklist.findOne({ where: { jti } });
    return !!row;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentJti?: string,
    currentExpSeconds?: number,
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    if (newPassword.length < 8) throw new BadRequestException('New password must be at least 8 characters');
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      throw new BadRequestException('New password must be different from the current one');
    }
    await this.users.setPassword(userId, await bcrypt.hash(newPassword, 10));

    // Revoke every active refresh token for this user (kick other devices).
    await this.refresh.createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :uid AND revoked_at IS NULL', { uid: userId })
      .execute();

    // Blocklist the current access-token jti so this session ends everywhere.
    if (currentJti) {
      const expiresAt = currentExpSeconds
        ? new Date(currentExpSeconds * 1000)
        : new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
      try {
        await this.blocklist.save(this.blocklist.create({ jti: currentJti, expiresAt }));
      } catch {
        // Unique conflict is fine.
      }
    }

    return {
      ok: true,
      message: 'Contraseña actualizada. Ingresa de nuevo en tus otros dispositivos.',
    };
  }

  sign(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}
