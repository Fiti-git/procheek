import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { VendorProfile, CommissionRule } from './entities/vendor-profile.entity';
import { SalesLead } from './entities/sales-lead.entity';
import { SalesDeal } from './entities/sales-deal.entity';
import { Commission } from './entities/commission.entity';
import { User } from '../users/user.entity';
import { Role } from '../../common/roles';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

export interface CommissionCalculation {
  pct: number;
  amount: number;
}

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(VendorProfile) private readonly profiles: Repository<VendorProfile>,
    @InjectRepository(SalesLead) private readonly leads: Repository<SalesLead>,
    @InjectRepository(SalesDeal) private readonly deals: Repository<SalesDeal>,
    @InjectRepository(Commission) private readonly commissions: Repository<Commission>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // ============================================================
  // Commission calculator
  // ============================================================
  calculateCommission(
    rule: CommissionRule | Record<string, any>,
    amount: number,
    packageName?: string,
    mtdVolume: number = 0,
  ): CommissionCalculation {
    if (!rule || typeof rule !== 'object' || !rule.type) {
      throw new BadRequestException('Invalid commission rule');
    }
    const r: any = rule;
    switch (r.type) {
      case 'flat': {
        const pct = Number(r.flat_pct ?? 0);
        return { pct, amount: round2((amount * pct) / 100) };
      }
      case 'package_tier': {
        const tiers: Array<{ package: string; pct: number }> = r.package_tiers ?? [];
        const match = tiers.find((t) => t.package === packageName);
        if (!match) {
          throw new BadRequestException(`No matching package tier for '${packageName}'`);
        }
        const pct = Number(match.pct);
        return { pct, amount: round2((amount * pct) / 100) };
      }
      case 'volume_tier': {
        const brackets: Array<{ min: number; max?: number | null; pct: number }> = r.brackets ?? [];
        const total = mtdVolume + amount;
        const match = brackets.find(
          (b) => total >= Number(b.min) && (b.max == null || total <= Number(b.max)),
        );
        if (!match) {
          throw new BadRequestException('No matching volume bracket');
        }
        const pct = Number(match.pct);
        return { pct, amount: round2((amount * pct) / 100) };
      }
      case 'custom': {
        const expr = String(r.expression ?? '');
        return this.evalCustom(expr, amount);
      }
      default:
        throw new BadRequestException(`Unknown commission rule type: ${r.type}`);
    }
  }

  private evalCustom(expr: string, amount: number): CommissionCalculation {
    // Strip the two allowed identifiers first; what remains must only be
    // digits, whitespace, and the operators + - * / % ( ) . This is stricter
    // than a character class that lumps letters together and lets stray
    // letters like 'a' or 'r' slip through.
    const stripped = expr.replace(/amount|bonus/gi, '');
    const allow = /^[\s0-9+\-*/%().]*$/;
    if (!allow.test(stripped)) {
      throw new BadRequestException('Custom expression contains disallowed characters');
    }
    const tokens = expr.replace(/amount/gi, ' amount ').replace(/bonus/gi, ' bonus ').split(/\s+/);
    for (const t of tokens) {
      if (!t) continue;
      if (/^[0-9]+(\.[0-9]+)?$/.test(t)) continue;
      if (/^[+\-*/%()]+$/.test(t)) continue;
      if (t.toLowerCase() === 'amount' || t.toLowerCase() === 'bonus') continue;
      throw new BadRequestException(`Invalid token in custom expression: ${t}`);
    }
    let commissionAmount: number;
    try {
      const fn = new Function('amount', 'bonus', `"use strict"; return (${expr});`);
      commissionAmount = Number(fn(amount, 0));
    } catch (e: any) {
      throw new BadRequestException(`Invalid custom expression: ${e?.message ?? e}`);
    }
    if (!Number.isFinite(commissionAmount)) {
      throw new BadRequestException('Custom expression did not return a finite number');
    }
    const pct = amount > 0 ? round2((commissionAmount / amount) * 100) : 0;
    return { pct, amount: round2(commissionAmount) };
  }

  previewCommission(rule: Record<string, any>, amount: number, packageName?: string) {
    return this.calculateCommission(rule as CommissionRule, amount, packageName);
  }

  // ============================================================
  // Scope helpers
  // ============================================================
  private assertAdmin(actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Principal admin only');
    }
  }

  private assertVendedorOrAdmin(actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN && actor.role !== Role.VENDEDOR) {
      throw new ForbiddenException('Vendedor or admin only');
    }
  }

  // ============================================================
  // Leads
  // ============================================================
  async listLeads(actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return this.leads.find({ order: { createdAt: 'DESC' } });
    }
    if (actor.role === Role.VENDEDOR) {
      return this.leads.find({ where: { vendedorId: actor.userId }, order: { createdAt: 'DESC' } });
    }
    throw new ForbiddenException('Insufficient role');
  }

  async createLead(dto: CreateLeadDto, actor: RequestUser) {
    this.assertVendedorOrAdmin(actor);
    let vendedorId = actor.userId;
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      if (!dto.vendedorId) throw new BadRequestException('vendedorId required for admin');
      vendedorId = dto.vendedorId;
    }
    const lead = this.leads.create({
      vendedorId,
      companyName: dto.companyName,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail ?? null,
      contactPhone: dto.contactPhone ?? null,
      industry: dto.industry ?? null,
      expectedAmount: dto.expectedAmount ?? null,
      status: (dto.status as any) ?? 'nuevo',
      notes: dto.notes ?? null,
    });
    return this.leads.save(lead);
  }

  async updateLead(id: string, dto: UpdateLeadDto, actor: RequestUser) {
    const lead = await this.leads.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    if (actor.role !== Role.PRINCIPAL_ADMIN && lead.vendedorId !== actor.userId) {
      throw new ForbiddenException('Cannot update this lead');
    }
    Object.assign(lead, dto);
    if (
      dto.status &&
      (dto.status === 'cerrado_ganado' || dto.status === 'cerrado_perdido') &&
      !lead.closedAt
    ) {
      lead.closedAt = new Date();
    }
    return this.leads.save(lead);
  }

  async deleteLead(id: string, actor: RequestUser) {
    const lead = await this.leads.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    if (actor.role !== Role.PRINCIPAL_ADMIN && lead.vendedorId !== actor.userId) {
      throw new ForbiddenException('Cannot delete this lead');
    }
    await this.leads.delete(id);
    return { id, deleted: true };
  }

  // ============================================================
  // Deals
  // ============================================================
  async listDeals(actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return this.deals.find({ order: { closedAt: 'DESC' } });
    }
    if (actor.role === Role.VENDEDOR) {
      return this.deals.find({ where: { vendedorId: actor.userId }, order: { closedAt: 'DESC' } });
    }
    throw new ForbiddenException('Insufficient role');
  }

  async createDeal(dto: CreateDealDto, actor: RequestUser) {
    this.assertVendedorOrAdmin(actor);
    let vendedorId = actor.userId;
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      if (!dto.vendedorId) throw new BadRequestException('vendedorId required for admin');
      vendedorId = dto.vendedorId;
    }
    const profile = await this.profiles.findOne({ where: { userId: vendedorId } });
    if (!profile) throw new NotFoundException('Vendor profile not found');

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const mtdDeals = await this.deals.find({
      where: { vendedorId, closedAt: Between(monthStart, monthEnd) },
    });
    const mtdVolume = mtdDeals.reduce((s, d) => s + Number(d.amount), 0);

    const calc = this.calculateCommission(profile.commissionRule, dto.amount, dto.package, mtdVolume);

    const deal = await this.deals.save(
      this.deals.create({
        vendedorId,
        leadId: dto.leadId ?? null,
        buyerCompanyId: dto.buyerCompanyId ?? null,
        buyerName: dto.buyerName,
        package: dto.package,
        amount: dto.amount,
        commissionPct: calc.pct,
        commissionAmount: calc.amount,
        commissionRuleSnapshot: profile.commissionRule,
        closedAt: now,
      }),
    );

    const periodMonth = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, '0')}-01`;
    await this.commissions.save(
      this.commissions.create({
        vendedorId,
        dealId: deal.id,
        amount: calc.amount,
        status: 'pending',
        periodMonth,
      }),
    );

    return deal;
  }

  // ============================================================
  // Commissions
  // ============================================================
  async listCommissions(
    actor: RequestUser,
    filters: { vendedorId?: string; periodMonth?: string },
  ) {
    const where: any = {};
    if (actor.role === Role.VENDEDOR) {
      where.vendedorId = actor.userId;
    } else if (actor.role === Role.PRINCIPAL_ADMIN) {
      if (filters.vendedorId) where.vendedorId = filters.vendedorId;
    } else {
      throw new ForbiddenException('Insufficient role');
    }
    if (filters.periodMonth) where.periodMonth = filters.periodMonth;
    return this.commissions.find({ where, order: { createdAt: 'DESC' } });
  }

  async updateCommission(id: string, dto: UpdateCommissionDto, actor: RequestUser) {
    this.assertAdmin(actor);
    const c = await this.commissions.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Commission not found');
    c.status = dto.status;
    if (dto.notes !== undefined) c.notes = dto.notes;
    if (dto.status === 'paid' && !c.paidAt) c.paidAt = new Date();
    return this.commissions.save(c);
  }

  // ============================================================
  // Vendor profiles
  // ============================================================
  async getMyVendorProfile(actor: RequestUser) {
    const profile = await this.profiles.findOne({ where: { userId: actor.userId } });
    if (!profile) throw new NotFoundException('Vendor profile not found');
    return profile;
  }

  async getVendorProfile(userId: string, actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN && actor.userId !== userId) {
      throw new ForbiddenException('Cannot access this profile');
    }
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Vendor profile not found');
    return profile;
  }

  async updateVendorProfile(userId: string, dto: UpdateVendorProfileDto, actor: RequestUser) {
    this.assertAdmin(actor);
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Vendor profile not found');
    Object.assign(profile, {
      ...dto,
      commissionRule: (dto.commissionRule as any) ?? profile.commissionRule,
    });
    return this.profiles.save(profile);
  }

  // ============================================================
  // Dashboard
  // ============================================================
  async dashboardSummary(actor: RequestUser) {
    if (actor.role !== Role.VENDEDOR && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Insufficient role');
    }
    const vendedorId = actor.userId;
    const profile = await this.profiles.findOne({ where: { userId: vendedorId } });

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

    const dealsMtd = await this.deals.find({
      where: { vendedorId, closedAt: Between(monthStart, monthEnd) },
    });
    const soldMtd = dealsMtd.reduce((s, d) => s + Number(d.amount), 0);

    const activeLeads = await this.leads.find({
      where: [
        { vendedorId, status: 'nuevo' },
        { vendedorId, status: 'contactado' },
        { vendedorId, status: 'propuesta' },
      ],
    });
    const pipelineValue = activeLeads.reduce((s, l) => s + Number(l.expectedAmount ?? 0), 0);

    const pendingCommissions = await this.commissions.find({
      where: [
        { vendedorId, status: 'pending' },
        { vendedorId, status: 'approved' },
      ],
    });
    const commissionPending = pendingCommissions.reduce((s, c) => s + Number(c.amount), 0);

    const paidCommissions = await this.commissions.find({
      where: { vendedorId, status: 'paid' },
    });
    const commissionPaidYtd = paidCommissions
      .filter((c) => c.paidAt && c.paidAt >= yearStart)
      .reduce((s, c) => s + Number(c.amount), 0);

    return {
      quota_mtd: Number(profile?.quotaMonthly ?? 0),
      sold_mtd: round2(soldMtd),
      pipeline_value: round2(pipelineValue),
      active_leads: activeLeads.length,
      commission_pending: round2(commissionPending),
      commission_paid_ytd: round2(commissionPaidYtd),
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
