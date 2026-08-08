import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: 'cert-1', ...v })),
    create: jest.fn().mockImplementation((v: any) => v),
    delete: jest.fn(),
  } as any;
}

function make(cfg: { mailKey?: string } = {}) {
  const repos = { cert: repo(), enroll: repo(), courses: repo(), users: repo() };
  const mail = {
    sendCertificateIssued: jest.fn().mockResolvedValue(undefined),
    sendPasswordReset: jest.fn(),
  } as any;
  const config = {
    get: jest.fn((key: string, def?: any) => {
      if (key === 'RESEND_API_KEY') return cfg.mailKey;
      if (key === 'APP_URL') return 'http://localhost:3000';
      return def;
    }),
  } as any;
  const notifications = { create: jest.fn().mockResolvedValue(undefined) } as any;
  const audit = { record: jest.fn() } as any;
  const svc = new CertificatesService(
    repos.cert, repos.enroll, repos.courses, repos.users,
    mail, config, notifications, audit,
  );
  return { svc, ...repos, mail, config, notifications, audit };
}

describe('CertificatesService.findByFolio', () => {
  it('looks up by id when input matches a UUID pattern', async () => {
    const { svc, cert } = make();
    const uuid = '11111111-2222-3333-4444-555555555555';
    cert.findOne.mockResolvedValueOnce({ id: uuid, code: 'PC-AAAA-BBBB-CCCC' });
    const res = await svc.findByFolio(uuid);
    expect(cert.findOne).toHaveBeenCalledWith({ where: { id: uuid } });
    expect(res?.id).toBe(uuid);
  });

  it('accepts PC-XXXX code and normalizes to uppercase', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValueOnce(null); // id lookup skipped
    cert.findOne.mockResolvedValueOnce({ id: 'x', code: 'PC-AAAA-BBBB-CCCC' });
    await svc.findByFolio('pc-aaaa-bbbb-cccc');
    expect(cert.findOne).toHaveBeenCalledWith({ where: { code: 'PC-AAAA-BBBB-CCCC' } });
  });

  it('falls through to dc3Folio lookup when no code match', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValueOnce(null);
    cert.findOne.mockResolvedValueOnce({ id: 'z', code: 'PC-Z', dc3Folio: 'DC3-2024-001' });
    const res = await svc.findByFolio('DC3-2024-001');
    expect(cert.findOne).toHaveBeenLastCalledWith({ where: { dc3Folio: 'DC3-2024-001' } });
    expect(res?.dc3Folio).toBe('DC3-2024-001');
  });
});

describe('CertificatesService.emailCertificateTo', () => {
  const baseCert: any = {
    id: 'cert-1',
    userId: 'u-1',
    courseId: 'c-1',
    code: 'PC-AAAA-BBBB-CCCC',
    dc3Folio: null,
    issuedAt: new Date(),
    expiresAt: null,
    revokedAt: null,
  };

  it('returns metadata_missing when holder or course cannot be loaded', async () => {
    const { svc, users, courses } = make();
    users.findOne.mockResolvedValue(null);
    courses.findOne.mockResolvedValue(null);
    const res = await svc.emailCertificateTo(baseCert);
    expect(res).toEqual({ ok: false, delivered: false, reason: 'certificate_metadata_missing' });
  });

  it('when mail not configured (no RESEND_API_KEY) returns delivered=false with mail_not_configured', async () => {
    const { svc, users, courses } = make({ mailKey: undefined });
    users.findOne.mockResolvedValue({ id: 'u-1', email: 'h@x.com', firstName: 'H', lastName: 'X' });
    courses.findOne.mockResolvedValue({ id: 'c-1', titleEs: 'Curso', nomReference: 'NOM-1' });
    const res = await svc.emailCertificateTo(baseCert);
    expect(res.ok).toBe(true);
    expect(res.delivered).toBe(false);
    expect(res.reason).toBe('mail_not_configured');
  });

  it('when mail is configured returns delivered=true', async () => {
    const { svc, users, courses, mail } = make({ mailKey: 'resend-key' });
    users.findOne.mockResolvedValue({ id: 'u-1', email: 'h@x.com', firstName: 'H', lastName: 'X' });
    courses.findOne.mockResolvedValue({ id: 'c-1', titleEs: 'Curso', nomReference: 'NOM-1' });
    const res = await svc.emailCertificateTo(baseCert);
    expect(mail.sendCertificateIssued).toHaveBeenCalled();
    expect(res.ok).toBe(true);
    expect(res.delivered).toBe(true);
  });

  it('graceful fallback when mail service throws', async () => {
    const { svc, users, courses, mail } = make({ mailKey: 'resend-key' });
    users.findOne.mockResolvedValue({ id: 'u-1', email: 'h@x.com', firstName: 'H', lastName: 'X' });
    courses.findOne.mockResolvedValue({ id: 'c-1', titleEs: 'Curso', nomReference: 'NOM-1' });
    mail.sendCertificateIssued.mockRejectedValueOnce(new Error('smtp down'));
    const res = await svc.emailCertificateTo(baseCert);
    expect(res.ok).toBe(true);
    expect(res.delivered).toBe(false);
    expect(res.reason).toBe('mail_send_failed');
  });
});

const adminActor = { userId: 'admin-1', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
const employeeActor = { userId: 'u-1', email: 'u@x.com', role: Role.EMPLOYEE };

describe('CertificatesService.issueForEnrollment', () => {
  it('returns existing when already issued', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue({ id: 'existing', code: 'PC-X' });
    const res = await svc.issueForEnrollment('enr-1');
    expect(res.id).toBe('existing');
  });

  it('throws NotFound when enrollment missing', async () => {
    const { svc, cert, enroll } = make();
    cert.findOne.mockResolvedValue(null);
    enroll.findOne.mockResolvedValue(null);
    await expect(svc.issueForEnrollment('enr-1')).rejects.toThrow(NotFoundException);
  });

  it('throws Forbidden when enrollment not completed', async () => {
    const { svc, cert, enroll } = make();
    cert.findOne.mockResolvedValue(null);
    enroll.findOne.mockResolvedValue({ id: 'enr-1', status: 'active' });
    await expect(svc.issueForEnrollment('enr-1')).rejects.toThrow(ForbiddenException);
  });

  it('creates a certificate with expiresAt when course has validity', async () => {
    const { svc, cert, enroll, courses } = make();
    cert.findOne.mockResolvedValue(null);
    enroll.findOne.mockResolvedValue({ id: 'enr-1', userId: 'u-1', courseId: 'c-1', status: 'completed' });
    courses.findOne.mockResolvedValue({ id: 'c-1', validityMonths: 12 });
    const res: any = await svc.issueForEnrollment('enr-1');
    expect(res.code).toMatch(/^PC-/);
    expect(res.expiresAt).toBeInstanceOf(Date);
  });

  it('creates without expiresAt when course has no validity', async () => {
    const { svc, cert, enroll, courses } = make();
    cert.findOne.mockResolvedValue(null);
    enroll.findOne.mockResolvedValue({ id: 'enr-1', userId: 'u-1', courseId: 'c-1', status: 'completed' });
    courses.findOne.mockResolvedValue({ id: 'c-1', validityMonths: null });
    const res: any = await svc.issueForEnrollment('enr-1');
    expect(res.expiresAt).toBeNull();
  });
});

describe('CertificatesService.revoke', () => {
  it('sets revokedAt + reason and records audit', async () => {
    const { svc, cert, audit } = make();
    cert.findOne.mockResolvedValue({ id: 'cert-1', userId: 'u-1', code: 'PC-X', revokedAt: null });
    const res: any = await svc.revoke('cert-1', 'Fraud detected', adminActor);
    expect(res.revokedAt).toBeInstanceOf(Date);
    expect(res.revokedReason).toBe('Fraud detected');
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'certificate.revoke' }));
  });

  it('uses default reason when empty', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue({ id: 'cert-1', userId: 'u-1', code: 'PC-X', revokedAt: null });
    const res: any = await svc.revoke('cert-1', '', adminActor);
    expect(res.revokedReason).toBe('Revoked by administrator');
  });

  it('is idempotent when already revoked', async () => {
    const { svc, cert } = make();
    const already = new Date('2024-01-01');
    cert.findOne.mockResolvedValue({ id: 'cert-1', revokedAt: already, revokedReason: 'x' });
    const res: any = await svc.revoke('cert-1', 'new reason');
    expect(res.revokedAt).toBe(already);
  });

  it('throws NotFound when cert missing', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue(null);
    await expect(svc.revoke('cert-1', 'r')).rejects.toThrow(NotFoundException);
  });
});

describe('CertificatesService.lookup', () => {
  it('returns holder and course info', async () => {
    const { svc, cert, users, courses } = make();
    cert.findOne.mockResolvedValue({
      id: 'c1', code: 'PC-X', userId: 'u-1', courseId: 'co-1',
      issuedAt: new Date('2024-01-01'), expiresAt: null, revokedAt: null, dc3Folio: null,
    });
    users.findOne.mockResolvedValue({ id: 'u-1', firstName: 'H', lastName: 'X' });
    courses.findOne.mockResolvedValue({ id: 'co-1', titleEs: 'Curso', nomReference: 'NOM-1' });
    const res = await svc.lookup('pc-x');
    expect(res.holder).toBe('H X');
    expect(res.course).toBe('Curso');
    expect(res.nomReference).toBe('NOM-1');
  });

  it('throws NotFound when code missing', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue(null);
    await expect(svc.lookup('pc-x')).rejects.toThrow(NotFoundException);
  });
});

describe('CertificatesService.listMine and helpers', () => {
  it('listMine scopes by userId', async () => {
    const { svc, cert } = make();
    cert.find.mockResolvedValue([{ id: 'c-1' }]);
    const res = await svc.listMine(employeeActor);
    expect(cert.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u-1' } }));
    expect(res).toHaveLength(1);
  });

  it('findByCode normalizes to uppercase', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue({ id: 'x' });
    await svc.findByCode('pc-abc');
    expect(cert.findOne).toHaveBeenCalledWith({ where: { code: 'PC-ABC' } });
  });

  it('findById proxies to repo', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue({ id: 'x' });
    const res = await svc.findById('x');
    expect(res?.id).toBe('x');
  });

  it('listAll returns rows ordered by issuedAt', async () => {
    const { svc, cert } = make();
    cert.find.mockResolvedValue([{ id: 'a' }]);
    const res = await svc.listAll();
    expect(res).toHaveLength(1);
  });
});

describe('CertificatesService.adminIssue and updateAdmin', () => {
  it('adminIssue with enrollmentId creates a fresh certificate', async () => {
    const { svc, cert, enroll, courses } = make();
    enroll.findOne.mockResolvedValue({ id: 'enr-1', userId: 'u-1', courseId: 'c-1', status: 'completed' });
    cert.findOne.mockResolvedValue(null);
    courses.findOne.mockResolvedValue({ id: 'c-1', validityMonths: 6 });
    const res: any = await svc.adminIssue({ enrollmentId: 'enr-1' }, adminActor);
    expect(res.code).toMatch(/^PC-/);
  });

  it('adminIssue with userId+courseId auto-creates enrollment', async () => {
    const { svc, cert, enroll, courses } = make();
    enroll.findOne.mockResolvedValue(null);
    enroll.save.mockImplementation((v: any) => Promise.resolve({ id: 'enr-new', ...v }));
    cert.findOne.mockResolvedValue(null);
    courses.findOne.mockResolvedValue({ id: 'c-1', validityMonths: null });
    const res: any = await svc.adminIssue({ userId: 'u-1', courseId: 'c-1' }, adminActor);
    expect(res.enrollmentId).toBe('enr-new');
  });

  it('adminIssue throws NotFound with no ids', async () => {
    const { svc } = make();
    await expect(svc.adminIssue({}, adminActor)).rejects.toThrow(NotFoundException);
  });

  it('updateAdmin sets dc3Folio', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue({ id: 'cert-1', code: 'PC-X' });
    const res: any = await svc.updateAdmin('cert-1', { dc3Folio: 'DC3-2024-001' }, adminActor);
    expect(res.dc3Folio).toBe('DC3-2024-001');
  });

  it('updateAdmin throws NotFound when cert missing', async () => {
    const { svc, cert } = make();
    cert.findOne.mockResolvedValue(null);
    await expect(svc.updateAdmin('bad', {}, adminActor)).rejects.toThrow(NotFoundException);
  });
});
