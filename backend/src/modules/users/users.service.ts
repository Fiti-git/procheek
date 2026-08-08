import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/roles';
import { Company } from '../companies/company.entity';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

function generateTempPassword(): string {
  return randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10);
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  private auditFor(action: string, entityId: string, actor: RequestUser, metadata?: Record<string, unknown>) {
    return this.audit.record({
      actorId: actor.userId,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      entityType: 'user',
      entityId,
      metadata: metadata ?? null,
    });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  touchLastLogin(id: string) {
    return this.repo.update(id, { lastLoginAt: new Date() });
  }

  setPassword(id: string, passwordHash: string) {
    return this.repo.update(id, { passwordHash, mustChangePassword: false });
  }

  async invite(dto: InviteUserDto, actor: RequestUser) {
    const email = dto.email.toLowerCase();
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    let companyId: string | null = dto.companyId ?? null;

    // RBAC on the invite:
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      // Can invite anyone into any company (validated below).
    } else if (actor.role === Role.CLIENT_ADMIN || actor.role === Role.CLIENT) {
      // Client / Client Admin: can only invite Employees or Subcontractors into their own company
      // (or a subcontractor company they own).
      const acting = await this.repo.findOne({ where: { id: actor.userId } });
      if (!acting?.companyId) throw new ForbiddenException('User has no company');
      if (![Role.EMPLOYEE, Role.SUBCONTRACTOR].includes(dto.role)) {
        throw new ForbiddenException('Cannot invite that role');
      }
      if (!companyId) {
        companyId = acting.companyId;
      } else if (companyId !== acting.companyId) {
        const target = await this.companies.findOne({ where: { id: companyId } });
        if (!target || target.parentCompanyId !== acting.companyId) {
          throw new ForbiddenException('Cannot invite into that company');
        }
      }
    } else if (actor.role === Role.SUBCONTRACTOR) {
      // Subcontractor: can only invite Employees into their own subcontractor company.
      const acting = await this.repo.findOne({ where: { id: actor.userId } });
      if (!acting?.companyId) throw new ForbiddenException('User has no company');
      if (dto.role !== Role.EMPLOYEE) {
        throw new ForbiddenException('Subcontractor may only invite employees');
      }
      companyId = acting.companyId;
    } else {
      throw new ForbiddenException('Insufficient role');
    }

    if (companyId) {
      const company = await this.companies.findOne({ where: { id: companyId } });
      if (!company) throw new BadRequestException('companyId not found');
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await this.repo.save(
      this.repo.create({
        email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        companyId,
        curp: dto.curp ?? null,
        locale: dto.locale ?? 'es',
        isActive: true,
        mustChangePassword: true,
      }),
    );

    // Fetch inviter name + company name for a friendlier email — best-effort.
    let invitedByName: string | undefined;
    let companyName: string | undefined;
    try {
      const inviter = await this.repo.findOne({ where: { id: actor.userId } });
      if (inviter) invitedByName = `${inviter.firstName} ${inviter.lastName}`.trim();
      if (companyId) {
        const c = await this.companies.findOne({ where: { id: companyId } });
        if (c) companyName = c.legalName;
      }
    } catch { /* keep email working even if lookup fails */ }

    // Fire-and-forget email; failure shouldn't fail the invite call.
    this.mail.sendInvite({
      to: user.email,
      firstName: user.firstName,
      tempPassword,
      invitedByName,
      companyName,
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('[UsersService] invite email failed:', e?.message ?? e);
    });

    this.notifications.create({
      userId: user.id,
      kind: 'invite',
      title: 'Bienvenido a PROCHEECK',
      body: `Fuiste invitado${companyName ? ` a ${companyName}` : ''}. Cambia tu contraseña temporal al iniciar sesión.`,
      link: '/login',
    }).catch(() => undefined);

    this.auditFor('user.invite', user.id, actor, {
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    return {
      user: this.sanitize(user),
      tempPassword,
    };
  }

  async list(actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return (await this.repo.find({ order: { createdAt: 'DESC' } })).map((u) => this.sanitize(u));
    }
    const acting = await this.repo.findOne({ where: { id: actor.userId } });
    if (!acting?.companyId) return [];

    if (actor.role === Role.CLIENT || actor.role === Role.CLIENT_ADMIN) {
      // Own company + its subcontractor companies' users.
      const subs = await this.companies.find({ where: { parentCompanyId: acting.companyId } });
      const ids = [acting.companyId, ...subs.map((s) => s.id)];
      return (
        await this.repo.createQueryBuilder('u')
          .where('u.company_id IN (:...ids)', { ids })
          .orderBy('u.created_at', 'DESC')
          .getMany()
      ).map((u) => this.sanitize(u));
    }

    if (actor.role === Role.SUBCONTRACTOR) {
      return (
        await this.repo.find({ where: { companyId: acting.companyId }, order: { createdAt: 'DESC' } })
      ).map((u) => this.sanitize(u));
    }

    return [this.sanitize(acting)];
  }

  async findOneScoped(id: string, actor: RequestUser) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.assertReadable(user, actor);
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, actor: RequestUser) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.assertWritable(user, actor);
    if (dto.role && actor.role !== Role.PRINCIPAL_ADMIN && dto.role !== user.role) {
      throw new ForbiddenException('Only Principal Admin may change roles');
    }
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    this.auditFor('user.update', saved.id, actor, { fields: Object.keys(dto) });
    return this.sanitize(saved);
  }

  async deactivate(id: string, actor: RequestUser) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.assertWritable(user, actor);
    user.isActive = false;
    await this.repo.save(user);
    this.auditFor('user.deactivate', id, actor, { email: user.email });
    return { id, deactivated: true };
  }

  private async assertReadable(user: User, actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) return;
    if (user.id === actor.userId) return;
    const acting = await this.repo.findOne({ where: { id: actor.userId } });
    if (!acting?.companyId) throw new ForbiddenException('Cannot access');
    if (user.companyId === acting.companyId) return;
    // Sub-company user?
    const targetCompany = user.companyId
      ? await this.companies.findOne({ where: { id: user.companyId } })
      : null;
    if (targetCompany?.parentCompanyId === acting.companyId) return;
    throw new ForbiddenException('Cannot access this user');
  }

  private async assertWritable(user: User, actor: RequestUser) {
    // Anyone may edit their own profile.
    if (user.id === actor.userId) return;
    if (actor.role === Role.PRINCIPAL_ADMIN) return;
    if (actor.role === Role.CLIENT_ADMIN) {
      await this.assertReadable(user, actor);
      return;
    }
    throw new ForbiddenException('Insufficient role');
  }

  private sanitize(u: User) {
    const { passwordHash, ...rest } = u as any;
    return rest;
  }
}
