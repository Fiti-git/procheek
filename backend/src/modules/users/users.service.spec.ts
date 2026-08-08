import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: v?.id ?? 'u-new', ...v })),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn(),
    create: jest.fn().mockImplementation((v: any) => v),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  } as any;
}

function make() {
  const users = repo();
  const companies = repo();
  const mail = { sendInvite: jest.fn().mockResolvedValue(undefined) } as any;
  const notifications = { create: jest.fn().mockResolvedValue(undefined) } as any;
  const audit = { record: jest.fn().mockResolvedValue(undefined) } as any;
  const svc = new UsersService(users, companies, mail, notifications, audit);
  return { svc, users, companies, mail, notifications, audit };
}

const admin = { userId: 'admin', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
const clientAdmin = { userId: 'ca', email: 'ca@x.com', role: Role.CLIENT_ADMIN };
const subcontractor = { userId: 'sc', email: 'sc@x.com', role: Role.SUBCONTRACTOR };
const employee = { userId: 'emp', email: 'e@x.com', role: Role.EMPLOYEE };

describe('UsersService', () => {
  it('findByEmail lowercases the input', async () => {
    const { svc, users } = make();
    await svc.findByEmail('FOO@X.COM');
    expect(users.findOne).toHaveBeenCalledWith({ where: { email: 'foo@x.com' } });
  });

  it('findById returns the row', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'u-1' });
    const res = await svc.findById('u-1');
    expect(res?.id).toBe('u-1');
  });

  it('invite as admin succeeds and returns temp password', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue(null);
    const res = await svc.invite(
      { email: 'NEW@X.com', firstName: 'A', lastName: 'B', role: Role.EMPLOYEE } as any,
      admin,
    );
    expect(res.user.email).toBe('new@x.com');
    expect(res.tempPassword).toEqual(expect.any(String));
    expect(res.tempPassword.length).toBeGreaterThanOrEqual(6);
  });

  it('invite existing email is Conflict', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'u' });
    await expect(
      svc.invite({ email: 'x@x.com', firstName: 'A', lastName: 'B', role: Role.EMPLOYEE } as any, admin),
    ).rejects.toThrow(ConflictException);
  });

  it('invite by client_admin restricted to EMPLOYEE/SUBCONTRACTOR roles', async () => {
    const { svc, users } = make();
    users.findOne
      .mockResolvedValueOnce(null) // existing lookup
      .mockResolvedValueOnce({ id: 'ca', companyId: 'co-1' }); // acting
    await expect(
      svc.invite({ email: 'a@x.com', firstName: 'A', lastName: 'B', role: Role.CLIENT_ADMIN } as any, clientAdmin),
    ).rejects.toThrow(ForbiddenException);
  });

  it('invite by subcontractor only for EMPLOYEE role', async () => {
    const { svc, users } = make();
    users.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'sc', companyId: 'co-2' });
    await expect(
      svc.invite({ email: 'a@x.com', firstName: 'A', lastName: 'B', role: Role.SUBCONTRACTOR } as any, subcontractor),
    ).rejects.toThrow(ForbiddenException);
  });

  it('invite by employee is Forbidden', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValueOnce(null);
    await expect(
      svc.invite({ email: 'a@x.com', firstName: 'A', lastName: 'B', role: Role.EMPLOYEE } as any, employee),
    ).rejects.toThrow(ForbiddenException);
  });

  it('list as admin returns all users sanitized', async () => {
    const { svc, users } = make();
    users.find.mockResolvedValue([{ id: 'u-1', passwordHash: 'secret', email: 'x' }]);
    const res: any[] = await svc.list(admin);
    expect(res[0].passwordHash).toBeUndefined();
    expect(res[0].email).toBe('x');
  });

  it('list as subcontractor filters by own company', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'sc', companyId: 'co-1' });
    users.find.mockResolvedValue([{ id: 'u', passwordHash: 'h' }]);
    const res = await svc.list(subcontractor);
    expect(res).toHaveLength(1);
  });

  it('findOneScoped self access works', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'emp', passwordHash: 'h', email: 'e@x.com' });
    const res: any = await svc.findOneScoped('emp', employee);
    expect(res.passwordHash).toBeUndefined();
  });

  it('findOneScoped NotFound when user missing', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue(null);
    await expect(svc.findOneScoped('bad', admin)).rejects.toThrow(NotFoundException);
  });

  it('update by non-admin trying to change role is Forbidden', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'emp', role: Role.EMPLOYEE });
    await expect(
      svc.update('emp', { role: Role.CLIENT_ADMIN } as any, employee),
    ).rejects.toThrow(ForbiddenException);
  });

  it('update self applies changes', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'emp', role: Role.EMPLOYEE, firstName: 'Old' });
    const res: any = await svc.update('emp', { firstName: 'New' } as any, employee);
    expect(res.firstName).toBe('New');
    expect(res.passwordHash).toBeUndefined();
  });

  it('deactivate flips isActive and audits', async () => {
    const { svc, users, audit } = make();
    users.findOne.mockResolvedValue({ id: 'emp', email: 'e@x.com', isActive: true });
    const res = await svc.deactivate('emp', employee);
    expect(res).toEqual({ id: 'emp', deactivated: true });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.deactivate' }));
  });

  it('deactivate NotFound when missing', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue(null);
    await expect(svc.deactivate('bad', admin)).rejects.toThrow(NotFoundException);
  });
});
