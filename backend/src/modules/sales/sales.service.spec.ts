import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Role } from '../../common/roles';

function mockRepo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  } as any;
}

describe('SalesService.calculateCommission', () => {
  let svc: SalesService;

  beforeEach(() => {
    svc = new SalesService(
      mockRepo(),
      mockRepo(),
      mockRepo(),
      mockRepo(),
      mockRepo(),
    );
  });

  describe('flat rule', () => {
    it('flat 10% of 1000 returns pct 10 and amount 100', () => {
      const rule = { type: 'flat', flat_pct: 10 };
      expect(svc.calculateCommission(rule as any, 1000)).toEqual({ pct: 10, amount: 100 });
    });

    it('flat 0% of 5000 returns pct 0 and amount 0', () => {
      const rule = { type: 'flat', flat_pct: 0 };
      expect(svc.calculateCommission(rule as any, 5000)).toEqual({ pct: 0, amount: 0 });
    });

    it('flat 15.5% of 2000 returns pct 15.5 and amount 310', () => {
      const rule = { type: 'flat', flat_pct: 15.5 };
      expect(svc.calculateCommission(rule as any, 2000)).toEqual({ pct: 15.5, amount: 310 });
    });
  });

  describe('package_tier rule', () => {
    const rule = {
      type: 'package_tier',
      package_tiers: [
        { package: 'basic', pct: 8 },
        { package: 'plus', pct: 12 },
        { package: 'premium', pct: 18 },
      ],
    };

    it('matches plus at 12% and returns correct amount', () => {
      expect(svc.calculateCommission(rule as any, 1000, 'plus')).toEqual({ pct: 12, amount: 120 });
    });

    it('throws BadRequest for unknown package', () => {
      expect(() => svc.calculateCommission(rule as any, 1000, 'unknown')).toThrow(BadRequestException);
      expect(() => svc.calculateCommission(rule as any, 1000, 'unknown')).toThrow(
        /No matching package tier for 'unknown'/,
      );
    });

    it('throws when package_tiers is empty', () => {
      const empty = { type: 'package_tier', package_tiers: [] };
      expect(() => svc.calculateCommission(empty as any, 1000, 'plus')).toThrow(BadRequestException);
    });

    it('matches basic at 8% for 500', () => {
      expect(svc.calculateCommission(rule as any, 500, 'basic')).toEqual({ pct: 8, amount: 40 });
    });
  });

  describe('volume_tier rule', () => {
    const rule = {
      type: 'volume_tier',
      brackets: [
        { min: 0, max: 100000, pct: 5 },
        { min: 100000, max: 250000, pct: 8 },
        { min: 250000, max: null, pct: 12 },
      ],
    };

    it('bracket 1 (50k volume) uses 5%', () => {
      expect(svc.calculateCommission(rule as any, 50000, undefined, 0)).toEqual({ pct: 5, amount: 2500 });
    });

    it('bracket 2 (150k volume) uses 8%', () => {
      expect(svc.calculateCommission(rule as any, 50000, undefined, 100000)).toEqual({ pct: 8, amount: 4000 });
    });

    it('bracket 3 (500k volume) uses 12%', () => {
      expect(svc.calculateCommission(rule as any, 100000, undefined, 400000)).toEqual({ pct: 12, amount: 12000 });
    });
  });

  describe('custom formula', () => {
    it('formula "amount * 0.1" returns 10%', () => {
      const rule = { type: 'custom', expression: 'amount * 0.1' };
      expect(svc.calculateCommission(rule as any, 1000)).toEqual({ pct: 10, amount: 100 });
    });

    it('formula "amount * 0.1 + 500" adds bonus semantics', () => {
      const rule = { type: 'custom', expression: 'amount * 0.1 + 500' };
      const res = svc.calculateCommission(rule as any, 1000);
      expect(res.amount).toBe(600);
      expect(res.pct).toBe(60);
    });

    it('throws on dangerous input like process.exit(1)', () => {
      const rule = { type: 'custom', expression: 'process.exit(1)' };
      expect(() => svc.calculateCommission(rule as any, 1000)).toThrow(BadRequestException);
    });

    it('throws on expression using disallowed identifiers', () => {
      const rule = { type: 'custom', expression: 'require("fs")' };
      expect(() => svc.calculateCommission(rule as any, 1000)).toThrow(BadRequestException);
    });
  });

  describe('edge cases', () => {
    it('flat rule with amount 0 returns 0', () => {
      const rule = { type: 'flat', flat_pct: 10 };
      expect(svc.calculateCommission(rule as any, 0)).toEqual({ pct: 10, amount: 0 });
    });

    it('throws on unknown rule type', () => {
      const rule = { type: 'not_a_type' };
      expect(() => svc.calculateCommission(rule as any, 1000)).toThrow(BadRequestException);
    });

    it('throws on null rule', () => {
      expect(() => svc.calculateCommission(null as any, 1000)).toThrow(BadRequestException);
    });
  });
});

function fullRepo() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: v?.id ?? 'row-1', ...v })),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    create: jest.fn().mockImplementation((v: any) => v),
  } as any;
}

function makeSales() {
  const profiles = fullRepo();
  const leads = fullRepo();
  const deals = fullRepo();
  const commissions = fullRepo();
  const users = fullRepo();
  const svc = new SalesService(profiles, leads, deals, commissions, users);
  return { svc, profiles, leads, deals, commissions, users };
}

const adminActor = { userId: 'admin-1', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
const vendedorActor = { userId: 'v-1', email: 'v@x.com', role: Role.VENDEDOR };
const employeeActor = { userId: 'e-1', email: 'e@x.com', role: Role.EMPLOYEE };

describe('SalesService leads', () => {
  it('createLead as vendedor uses actor.userId', async () => {
    const { svc, leads } = makeSales();
    const res: any = await svc.createLead({ companyName: 'C', contactName: 'X' } as any, vendedorActor);
    expect(res.vendedorId).toBe('v-1');
    expect(leads.save).toHaveBeenCalled();
  });

  it('createLead as admin without vendedorId throws BadRequest', async () => {
    const { svc } = makeSales();
    await expect(svc.createLead({ companyName: 'C', contactName: 'X' } as any, adminActor))
      .rejects.toThrow(BadRequestException);
  });

  it('createLead as admin with vendedorId uses it', async () => {
    const { svc } = makeSales();
    const res: any = await svc.createLead(
      { companyName: 'C', contactName: 'X', vendedorId: 'v-9' } as any,
      adminActor,
    );
    expect(res.vendedorId).toBe('v-9');
  });

  it('createLead as employee is Forbidden', async () => {
    const { svc } = makeSales();
    await expect(svc.createLead({ companyName: 'C', contactName: 'X' } as any, employeeActor))
      .rejects.toThrow(ForbiddenException);
  });

  it('updateLead by owner works and sets closedAt when status is cerrado_ganado', async () => {
    const { svc, leads } = makeSales();
    leads.findOne.mockResolvedValue({ id: 'l-1', vendedorId: 'v-1', closedAt: null });
    const res: any = await svc.updateLead('l-1', { status: 'cerrado_ganado' } as any, vendedorActor);
    expect(res.closedAt).toBeInstanceOf(Date);
  });

  it('updateLead by non-owner vendedor is Forbidden', async () => {
    const { svc, leads } = makeSales();
    leads.findOne.mockResolvedValue({ id: 'l-1', vendedorId: 'other', closedAt: null });
    await expect(svc.updateLead('l-1', {} as any, vendedorActor)).rejects.toThrow(ForbiddenException);
  });

  it('updateLead missing throws NotFound', async () => {
    const { svc, leads } = makeSales();
    leads.findOne.mockResolvedValue(null);
    await expect(svc.updateLead('bad', {} as any, adminActor)).rejects.toThrow(NotFoundException);
  });

  it('deleteLead by owner works', async () => {
    const { svc, leads } = makeSales();
    leads.findOne.mockResolvedValue({ id: 'l-1', vendedorId: 'v-1' });
    const res = await svc.deleteLead('l-1', vendedorActor);
    expect(res).toEqual({ id: 'l-1', deleted: true });
    expect(leads.delete).toHaveBeenCalledWith('l-1');
  });

  it('deleteLead by non-owner vendedor is Forbidden', async () => {
    const { svc, leads } = makeSales();
    leads.findOne.mockResolvedValue({ id: 'l-1', vendedorId: 'other' });
    await expect(svc.deleteLead('l-1', vendedorActor)).rejects.toThrow(ForbiddenException);
  });

  it('listLeads admin returns all', async () => {
    const { svc, leads } = makeSales();
    leads.find.mockResolvedValue([{ id: 'l-1' }]);
    const res = await svc.listLeads(adminActor);
    expect(res).toHaveLength(1);
  });

  it('listLeads vendedor is scoped', async () => {
    const { svc, leads } = makeSales();
    leads.find.mockResolvedValue([]);
    await svc.listLeads(vendedorActor);
    expect(leads.find).toHaveBeenCalledWith(expect.objectContaining({ where: { vendedorId: 'v-1' } }));
  });

  it('listLeads other role Forbidden', async () => {
    const { svc } = makeSales();
    await expect(svc.listLeads(employeeActor)).rejects.toThrow(ForbiddenException);
  });
});

describe('SalesService deals and commissions', () => {
  it('createDeal computes commission and inserts a commission row', async () => {
    const { svc, profiles, deals, commissions } = makeSales();
    profiles.findOne.mockResolvedValue({
      userId: 'v-1',
      commissionRule: { type: 'flat', flat_pct: 10 },
    });
    deals.find.mockResolvedValue([]);
    const res: any = await svc.createDeal(
      { buyerName: 'Buyer', package: 'basic', amount: 1000 } as any,
      vendedorActor,
    );
    expect(res.commissionPct).toBe(10);
    expect(res.commissionAmount).toBe(100);
    expect(commissions.save).toHaveBeenCalled();
  });

  it('createDeal missing profile throws NotFound', async () => {
    const { svc, profiles } = makeSales();
    profiles.findOne.mockResolvedValue(null);
    await expect(
      svc.createDeal({ buyerName: 'Buyer', package: 'basic', amount: 1000 } as any, vendedorActor),
    ).rejects.toThrow(NotFoundException);
  });

  it('listDeals admin returns all', async () => {
    const { svc, deals } = makeSales();
    deals.find.mockResolvedValue([{ id: 'd-1' }]);
    expect(await svc.listDeals(adminActor)).toHaveLength(1);
  });

  it('listDeals employee Forbidden', async () => {
    const { svc } = makeSales();
    await expect(svc.listDeals(employeeActor)).rejects.toThrow(ForbiddenException);
  });

  it('updateCommission as admin flips status to paid and sets paidAt', async () => {
    const { svc, commissions } = makeSales();
    commissions.findOne.mockResolvedValue({ id: 'c-1', status: 'pending', paidAt: null });
    const res: any = await svc.updateCommission('c-1', { status: 'paid' } as any, adminActor);
    expect(res.status).toBe('paid');
    expect(res.paidAt).toBeInstanceOf(Date);
  });

  it('updateCommission non-admin is Forbidden', async () => {
    const { svc } = makeSales();
    await expect(svc.updateCommission('c-1', { status: 'paid' } as any, vendedorActor))
      .rejects.toThrow(ForbiddenException);
  });

  it('listCommissions vendedor is scoped to self', async () => {
    const { svc, commissions } = makeSales();
    commissions.find.mockResolvedValue([]);
    await svc.listCommissions(vendedorActor, {});
    expect(commissions.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ vendedorId: 'v-1' }),
    }));
  });

  it('previewCommission wraps calculateCommission', () => {
    const { svc } = makeSales();
    expect(svc.previewCommission({ type: 'flat', flat_pct: 10 } as any, 1000)).toEqual({ pct: 10, amount: 100 });
  });
});

describe('SalesService vendor profiles and dashboard', () => {
  it('getVendorProfile as self works', async () => {
    const { svc, profiles } = makeSales();
    profiles.findOne.mockResolvedValue({ userId: 'v-1' });
    const res: any = await svc.getVendorProfile('v-1', vendedorActor);
    expect(res.userId).toBe('v-1');
  });

  it('getVendorProfile as different vendedor is Forbidden', async () => {
    const { svc } = makeSales();
    await expect(svc.getVendorProfile('other', vendedorActor)).rejects.toThrow(ForbiddenException);
  });

  it('getVendorProfile not found throws NotFound', async () => {
    const { svc, profiles } = makeSales();
    profiles.findOne.mockResolvedValue(null);
    await expect(svc.getVendorProfile('v-1', adminActor)).rejects.toThrow(NotFoundException);
  });

  it('updateVendorProfile non-admin is Forbidden', async () => {
    const { svc } = makeSales();
    await expect(svc.updateVendorProfile('v-1', {} as any, vendedorActor)).rejects.toThrow(ForbiddenException);
  });

  it('updateVendorProfile admin applies changes', async () => {
    const { svc, profiles } = makeSales();
    profiles.findOne.mockResolvedValue({ userId: 'v-1', commissionRule: { type: 'flat', flat_pct: 5 } });
    const res: any = await svc.updateVendorProfile('v-1', { quotaMonthly: 5000 } as any, adminActor);
    expect(res.quotaMonthly).toBe(5000);
  });

  it('dashboardSummary aggregates sold_mtd, pipeline, commissions', async () => {
    const { svc, profiles, deals, leads, commissions } = makeSales();
    profiles.findOne.mockResolvedValue({ quotaMonthly: 10000 });
    deals.find.mockResolvedValue([{ amount: 500 }, { amount: 1000 }]);
    leads.find.mockResolvedValue([{ expectedAmount: 2000 }, { expectedAmount: 3000 }]);
    commissions.find
      .mockResolvedValueOnce([{ amount: 100 }, { amount: 50 }]) // pending
      .mockResolvedValueOnce([{ amount: 200, paidAt: new Date() }]); // paid
    const res = await svc.dashboardSummary(vendedorActor);
    expect(res.sold_mtd).toBe(1500);
    expect(res.pipeline_value).toBe(5000);
    expect(res.commission_pending).toBe(150);
    expect(res.commission_paid_ytd).toBe(200);
    expect(res.active_leads).toBe(2);
    expect(res.quota_mtd).toBe(10000);
  });

  it('dashboardSummary rejects employee role', async () => {
    const { svc } = makeSales();
    await expect(svc.dashboardSummary(employeeActor)).rejects.toThrow(ForbiddenException);
  });

  it('getMyVendorProfile returns profile', async () => {
    const { svc, profiles } = makeSales();
    profiles.findOne.mockResolvedValue({ userId: 'v-1' });
    const res: any = await svc.getMyVendorProfile(vendedorActor);
    expect(res.userId).toBe('v-1');
  });

  it('getMyVendorProfile missing throws NotFound', async () => {
    const { svc, profiles } = makeSales();
    profiles.findOne.mockResolvedValue(null);
    await expect(svc.getMyVendorProfile(vendedorActor)).rejects.toThrow(NotFoundException);
  });
});
