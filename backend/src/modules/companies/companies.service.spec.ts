import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: v?.id ?? 'co-new', ...v })),
    create: jest.fn().mockImplementation((v: any) => v),
    softRemove: jest.fn().mockResolvedValue(undefined),
  } as any;
}

function make() {
  const companies = repo();
  const users = repo();
  const audit = { record: jest.fn().mockResolvedValue(undefined) } as any;
  const svc = new CompaniesService(companies, users, audit);
  return { svc, companies, users, audit };
}

const admin = { userId: 'a', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
const clientAdmin = { userId: 'ca', email: 'ca@x.com', role: Role.CLIENT_ADMIN };
const client = { userId: 'c', email: 'c@x.com', role: Role.CLIENT };
const employee = { userId: 'e', email: 'e@x.com', role: Role.EMPLOYEE };

describe('CompaniesService', () => {
  it('admin creates a client company', async () => {
    const { svc, companies } = make();
    const res: any = await svc.create({ legalName: 'ACME', type: 'client' } as any, admin);
    expect(res.legalName).toBe('ACME');
    expect(res.status).toBe('active');
    expect(companies.save).toHaveBeenCalled();
  });

  it('admin creates subcontractor requires parentCompanyId', async () => {
    const { svc } = make();
    await expect(
      svc.create({ legalName: 'Sub', type: 'subcontractor' } as any, admin),
    ).rejects.toThrow(BadRequestException);
  });

  it('client_admin creates subcontractor linked to own company', async () => {
    const { svc, companies, users } = make();
    users.findOne.mockResolvedValue({ id: 'ca', companyId: 'co-parent' });
    companies.findOne.mockResolvedValue({ id: 'co-parent', type: 'client' });
    const res: any = await svc.create({ legalName: 'Sub', type: 'subcontractor' } as any, clientAdmin);
    expect(res.parentCompanyId).toBe('co-parent');
  });

  it('client_admin cannot create client company', async () => {
    const { svc } = make();
    await expect(
      svc.create({ legalName: 'X', type: 'client' } as any, clientAdmin),
    ).rejects.toThrow(ForbiddenException);
  });

  it('employee cannot create any company', async () => {
    const { svc } = make();
    await expect(
      svc.create({ legalName: 'X', type: 'client' } as any, employee),
    ).rejects.toThrow(ForbiddenException);
  });

  it('create rejects parent that is not a client', async () => {
    const { svc, companies } = make();
    companies.findOne.mockResolvedValue({ id: 'p', type: 'subcontractor' });
    await expect(
      svc.create({ legalName: 'X', type: 'subcontractor', parentCompanyId: 'p' } as any, admin),
    ).rejects.toThrow(BadRequestException);
  });

  it('list as admin returns all', async () => {
    const { svc, companies } = make();
    companies.find.mockResolvedValue([{ id: 'c-1' }]);
    expect(await svc.list(admin)).toHaveLength(1);
  });

  it('list as client returns own + subs', async () => {
    const { svc, companies, users } = make();
    users.findOne.mockResolvedValue({ id: 'c', companyId: 'co-1' });
    companies.find.mockResolvedValue([{ id: 'co-1' }, { id: 'sub-1' }]);
    const res = await svc.list(client);
    expect(res).toHaveLength(2);
  });

  it('list as subcontractor returns own only', async () => {
    const { svc, companies, users } = make();
    users.findOne.mockResolvedValue({ id: 'sc', companyId: 'co-sub' });
    companies.find.mockResolvedValue([{ id: 'co-sub' }]);
    const res = await svc.list({ userId: 'sc', email: 'sc@x.com', role: Role.SUBCONTRACTOR });
    expect(res).toHaveLength(1);
  });

  it('list as employee returns empty', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'e', companyId: 'co-1' });
    expect(await svc.list(employee)).toEqual([]);
  });

  it('findOne NotFound', async () => {
    const { svc, companies } = make();
    companies.findOne.mockResolvedValue(null);
    await expect(svc.findOne('x', admin)).rejects.toThrow(NotFoundException);
  });

  it('findOne enforces scope for client_admin outside own tree', async () => {
    const { svc, companies, users } = make();
    companies.findOne.mockResolvedValue({ id: 'x', parentCompanyId: 'other' });
    users.findOne.mockResolvedValue({ id: 'ca', companyId: 'co-1' });
    await expect(svc.findOne('x', clientAdmin)).rejects.toThrow(ForbiddenException);
  });

  it('listSubcontractors for a client returns rows', async () => {
    const { svc, companies } = make();
    companies.findOne.mockResolvedValue({ id: 'c-1', type: 'client' });
    companies.find.mockResolvedValue([{ id: 'sub-1' }]);
    const res = await svc.listSubcontractors('c-1', admin);
    expect(res).toHaveLength(1);
  });

  it('listSubcontractors rejects when target is not a client', async () => {
    const { svc, companies } = make();
    companies.findOne.mockResolvedValue({ id: 'c-1', type: 'subcontractor' });
    await expect(svc.listSubcontractors('c-1', admin)).rejects.toThrow(BadRequestException);
  });

  it('update as admin applies changes', async () => {
    const { svc, companies } = make();
    companies.findOne.mockResolvedValue({ id: 'c-1', legalName: 'Old' });
    const res: any = await svc.update('c-1', { legalName: 'New' } as any, admin);
    expect(res.legalName).toBe('New');
  });

  it('remove by non-admin is Forbidden', async () => {
    const { svc } = make();
    await expect(svc.remove('c-1', clientAdmin)).rejects.toThrow(ForbiddenException);
  });

  it('remove by admin soft removes and audits', async () => {
    const { svc, companies, audit } = make();
    companies.findOne.mockResolvedValue({ id: 'c-1', legalName: 'X' });
    const res = await svc.remove('c-1', admin);
    expect(res).toEqual({ id: 'c-1', deleted: true });
    expect(companies.softRemove).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'company.delete' }));
  });
});
