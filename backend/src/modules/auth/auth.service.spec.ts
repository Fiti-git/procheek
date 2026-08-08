import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: 'r-' + Math.random(), ...v })),
    delete: jest.fn(),
    create: jest.fn().mockImplementation((v: any) => v),
    createQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    })),
  } as any;
}

function make() {
  const jwt = { sign: jest.fn((_p: any, _opts: any) => 'signed.jwt.token'), verify: jest.fn() } as any;
  const usersSvc = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    touchLastLogin: jest.fn().mockResolvedValue(undefined),
    setPassword: jest.fn().mockResolvedValue(undefined),
  } as any;
  const config = { get: jest.fn((_k: string, def: any) => def) } as any;
  const mail = { sendPasswordReset: jest.fn().mockResolvedValue(undefined) } as any;
  const resets = repo();
  const refresh = repo();
  const blocklist = repo();
  const svc = new AuthService(jwt, usersSvc, config, mail, resets, refresh, blocklist);
  return { svc, jwt, usersSvc, config, mail, resets, refresh, blocklist };
}

describe('AuthService', () => {
  it('bcrypt produces different hashes for the same password', async () => {
    const a = await bcrypt.hash('secret1234', 10);
    const b = await bcrypt.hash('secret1234', 10);
    expect(a).not.toBe(b);
    expect(await bcrypt.compare('secret1234', a)).toBe(true);
    expect(await bcrypt.compare('secret1234', b)).toBe(true);
  });

  it('login with correct password returns tokens', async () => {
    const { svc, usersSvc } = make();
    const hash = await bcrypt.hash('correct123', 10);
    usersSvc.findByEmail.mockResolvedValue({
      id: 'u-1', email: 'a@b.com', role: Role.CLIENT, isActive: true, passwordHash: hash,
      firstName: 'A', lastName: 'B', locale: 'es', mustChangePassword: false,
    });
    const res = await svc.login('a@b.com', 'correct123');
    expect(res.accessToken).toBe('signed.jwt.token');
    expect(res.refreshToken).toBeDefined();
    expect(res.tokenType).toBe('Bearer');
    expect(res.user.id).toBe('u-1');
  });

  it('login with wrong password throws Unauthorized', async () => {
    const { svc, usersSvc } = make();
    const hash = await bcrypt.hash('correct123', 10);
    usersSvc.findByEmail.mockResolvedValue({
      id: 'u-1', email: 'a@b.com', role: Role.CLIENT, isActive: true, passwordHash: hash,
    });
    await expect(svc.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('login stores a hashed refresh token in refresh repo', async () => {
    const { svc, usersSvc, refresh } = make();
    const hash = await bcrypt.hash('correct123', 10);
    usersSvc.findByEmail.mockResolvedValue({
      id: 'u-1', email: 'a@b.com', role: Role.CLIENT, isActive: true, passwordHash: hash,
      firstName: 'A', lastName: 'B', locale: 'es', mustChangePassword: false,
    });
    const res = await svc.login('a@b.com', 'correct123');
    expect(refresh.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u-1',
        tokenHash: expect.any(String),
      }),
    );
    // tokenHash stored is NOT the raw token
    const createArgs = refresh.create.mock.calls[0][0];
    expect(createArgs.tokenHash).not.toBe(res.refreshToken);
  });

  it('refreshTokens rotates: marks old revoked with replacedById, issues new pair', async () => {
    const { svc, usersSvc, refresh } = make();
    const existingRecord: any = {
      id: 'r-old',
      userId: 'u-1',
      tokenHash: 'hash',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      replacedById: null,
    };
    refresh.findOne.mockResolvedValue(existingRecord);
    usersSvc.findById.mockResolvedValue({
      id: 'u-1', email: 'a@b.com', role: Role.CLIENT, isActive: true,
    });
    const res = await svc.refreshTokens('anytoken');
    expect(res.accessToken).toBe('signed.jwt.token');
    expect(res.refreshToken).toBeDefined();
    expect(existingRecord.revokedAt).toBeInstanceOf(Date);
    expect(existingRecord.replacedById).toBeTruthy();
  });

  it('refreshTokens throws when record already revoked', async () => {
    const { svc, refresh } = make();
    refresh.findOne.mockResolvedValue({
      id: 'r-old',
      userId: 'u-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await expect(svc.refreshTokens('t')).rejects.toThrow(UnauthorizedException);
  });

  it('logout inserts jti into blocklist', async () => {
    const { svc, blocklist } = make();
    await svc.logout('u-1', 'jti-1', Math.floor(Date.now() / 1000) + 900);
    expect(blocklist.create).toHaveBeenCalledWith(
      expect.objectContaining({ jti: 'jti-1', expiresAt: expect.any(Date) }),
    );
    expect(blocklist.save).toHaveBeenCalled();
  });

  it('isJtiBlocked returns true when jti exists in blocklist', async () => {
    const { svc, blocklist } = make();
    blocklist.findOne.mockResolvedValue({ jti: 'jti-1' });
    expect(await svc.isJtiBlocked('jti-1')).toBe(true);
    blocklist.findOne.mockResolvedValue(null);
    expect(await svc.isJtiBlocked('jti-2')).toBe(false);
  });

  it('login rejects inactive user', async () => {
    const { svc, usersSvc } = make();
    usersSvc.findByEmail.mockResolvedValue({ id: 'u', email: 'x', isActive: false, passwordHash: 'h', role: Role.CLIENT });
    await expect(svc.login('x', 'p')).rejects.toThrow(UnauthorizedException);
  });

  it('login rejects unknown user', async () => {
    const { svc, usersSvc } = make();
    usersSvc.findByEmail.mockResolvedValue(null);
    await expect(svc.login('x', 'p')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshTokens rejects missing token', async () => {
    const { svc } = make();
    await expect(svc.refreshTokens('')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshTokens rejects expired record', async () => {
    const { svc, refresh } = make();
    refresh.findOne.mockResolvedValue({ id: 'r', userId: 'u', revokedAt: null, expiresAt: new Date(Date.now() - 1000) });
    await expect(svc.refreshTokens('t')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshTokens rejects when user inactive', async () => {
    const { svc, refresh, usersSvc } = make();
    refresh.findOne.mockResolvedValue({ id: 'r', userId: 'u', revokedAt: null, expiresAt: new Date(Date.now() + 60000) });
    usersSvc.findById.mockResolvedValue({ id: 'u', isActive: false });
    await expect(svc.refreshTokens('t')).rejects.toThrow(UnauthorizedException);
  });

  it('changePassword rotates password + revokes refresh tokens', async () => {
    const { svc, usersSvc, refresh, blocklist } = make();
    const hash = await bcrypt.hash('current123', 10);
    usersSvc.findById.mockResolvedValue({ id: 'u-1', passwordHash: hash });
    const res = await svc.changePassword('u-1', 'current123', 'newpassword1', 'jti-cur', Math.floor(Date.now() / 1000) + 60);
    expect(res.ok).toBe(true);
    expect(usersSvc.setPassword).toHaveBeenCalled();
    expect(refresh.createQueryBuilder).toHaveBeenCalled();
    expect(blocklist.save).toHaveBeenCalled();
  });

  it('changePassword rejects wrong current password', async () => {
    const { svc, usersSvc } = make();
    const hash = await bcrypt.hash('current123', 10);
    usersSvc.findById.mockResolvedValue({ id: 'u-1', passwordHash: hash });
    await expect(svc.changePassword('u-1', 'wrong', 'newpassword1')).rejects.toThrow(UnauthorizedException);
  });

  it('changePassword rejects same as current', async () => {
    const { svc, usersSvc } = make();
    const hash = await bcrypt.hash('current123', 10);
    usersSvc.findById.mockResolvedValue({ id: 'u-1', passwordHash: hash });
    await expect(svc.changePassword('u-1', 'current123', 'current123')).rejects.toThrow(BadRequestException);
  });

  it('changePassword rejects short new password', async () => {
    const { svc, usersSvc } = make();
    const hash = await bcrypt.hash('current123', 10);
    usersSvc.findById.mockResolvedValue({ id: 'u-1', passwordHash: hash });
    await expect(svc.changePassword('u-1', 'current123', 'short')).rejects.toThrow(BadRequestException);
  });

  it('changePassword rejects unknown user', async () => {
    const { svc, usersSvc } = make();
    usersSvc.findById.mockResolvedValue(null);
    await expect(svc.changePassword('x', 'a', 'b')).rejects.toThrow(UnauthorizedException);
  });

  it('requestPasswordReset is silent for unknown user', async () => {
    const { svc, usersSvc, resets } = make();
    usersSvc.findByEmail.mockResolvedValue(null);
    await svc.requestPasswordReset('nobody@x.com');
    expect(resets.save).not.toHaveBeenCalled();
  });

  it('requestPasswordReset creates hashed token and mails link when user exists', async () => {
    const { svc, usersSvc, resets, mail } = make();
    usersSvc.findByEmail.mockResolvedValue({ id: 'u-1', email: 'u@x.com', isActive: true });
    await svc.requestPasswordReset('u@x.com');
    expect(resets.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-1', tokenHash: expect.any(String) }),
    );
    expect(mail.sendPasswordReset).toHaveBeenCalled();
  });

  it('resetPassword succeeds with valid token and rotates', async () => {
    const { svc, resets, usersSvc } = make();
    resets.findOne.mockResolvedValue({
      userId: 'u-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const res = await svc.resetPassword('rawtoken', 'newpassword1');
    expect(res.ok).toBe(true);
    expect(usersSvc.setPassword).toHaveBeenCalled();
  });

  it('resetPassword rejects short password', async () => {
    const { svc } = make();
    await expect(svc.resetPassword('t', 'short')).rejects.toThrow(BadRequestException);
  });

  it('resetPassword rejects used token', async () => {
    const { svc, resets } = make();
    resets.findOne.mockResolvedValue({ userId: 'u', usedAt: new Date(), expiresAt: new Date(Date.now() + 1000) });
    await expect(svc.resetPassword('t', 'newpassword1')).rejects.toThrow(BadRequestException);
  });

  it('resetPassword rejects expired token', async () => {
    const { svc, resets } = make();
    resets.findOne.mockResolvedValue({ userId: 'u', usedAt: null, expiresAt: new Date(Date.now() - 1000) });
    await expect(svc.resetPassword('t', 'newpassword1')).rejects.toThrow(BadRequestException);
  });

  it('resetPassword rejects unknown token', async () => {
    const { svc, resets } = make();
    resets.findOne.mockResolvedValue(null);
    await expect(svc.resetPassword('t', 'newpassword1')).rejects.toThrow(BadRequestException);
  });

  it('logout with refresh token revokes it', async () => {
    const { svc, refresh } = make();
    refresh.findOne.mockResolvedValue({ id: 'r', userId: 'u-1', revokedAt: null });
    await svc.logout('u-1', undefined, undefined, 'rawtoken');
    expect(refresh.save).toHaveBeenCalled();
  });

  it('isJtiBlocked returns false for empty jti', async () => {
    const { svc } = make();
    expect(await svc.isJtiBlocked('')).toBe(false);
  });

  it('sign exposes jwt.sign', () => {
    const { svc, jwt } = make();
    svc.sign({ sub: 'u', email: 'x', role: Role.CLIENT });
    expect(jwt.sign).toHaveBeenCalled();
  });
});
