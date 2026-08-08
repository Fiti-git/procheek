import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from '../../common/roles';
import { User } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private readonly repo: Repository<Company>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly audit: AuditService,
  ) {}

  private auditFor(action: string, entityId: string, actor: RequestUser, metadata?: Record<string, unknown>) {
    return this.audit.record({
      actorId: actor.userId,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      entityType: 'company',
      entityId,
      metadata: metadata ?? null,
    });
  }

  private async loadActingUser(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    return user;
  }

  async create(dto: CreateCompanyDto, actor: RequestUser): Promise<Company> {
    // Principal Admin: create any company.
    // Client Admin: may create subcontractors only, linked to their own company.
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      if (dto.type === 'subcontractor' && !dto.parentCompanyId) {
        throw new BadRequestException('Subcontractor requires parentCompanyId');
      }
    } else if (actor.role === Role.CLIENT_ADMIN || actor.role === Role.CLIENT) {
      if (dto.type !== 'subcontractor') {
        throw new ForbiddenException('Only Principal Admin can create client companies');
      }
      const acting = await this.loadActingUser(actor.userId);
      if (!acting.companyId) throw new ForbiddenException('User has no company');
      dto.parentCompanyId = acting.companyId;
    } else {
      throw new ForbiddenException('Insufficient role');
    }

    if (dto.parentCompanyId) {
      const parent = await this.repo.findOne({ where: { id: dto.parentCompanyId } });
      if (!parent) throw new BadRequestException('parentCompanyId not found');
      if (parent.type !== 'client') throw new BadRequestException('Parent must be a client company');
    }

    const entity = this.repo.create({ ...dto, status: 'active', isActive: true });
    const saved = await this.repo.save(entity);
    this.auditFor('company.create', saved.id, actor, {
      legalName: saved.legalName, type: saved.type, parentCompanyId: saved.parentCompanyId,
    });
    return saved;
  }

  async list(actor: RequestUser): Promise<Company[]> {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    const acting = await this.loadActingUser(actor.userId);
    if (!acting.companyId) return [];

    if (actor.role === Role.CLIENT || actor.role === Role.CLIENT_ADMIN) {
      // Own company + its subcontractors.
      return this.repo.find({
        where: [{ id: acting.companyId }, { parentCompanyId: acting.companyId }],
        order: { createdAt: 'DESC' },
      });
    }
    if (actor.role === Role.SUBCONTRACTOR) {
      return this.repo.find({ where: { id: acting.companyId } });
    }
    return [];
  }

  async findOne(id: string, actor: RequestUser): Promise<Company> {
    const company = await this.repo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    await this.assertReadable(company, actor);
    return company;
  }

  async listSubcontractors(clientId: string, actor: RequestUser): Promise<Company[]> {
    const client = await this.repo.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Company not found');
    if (client.type !== 'client') throw new BadRequestException('Company is not a client');
    await this.assertReadable(client, actor);
    return this.repo.find({
      where: { parentCompanyId: clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateCompanyDto, actor: RequestUser): Promise<Company> {
    const company = await this.repo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    await this.assertWritable(company, actor);

    Object.assign(company, dto);
    const saved = await this.repo.save(company);
    this.auditFor('company.update', saved.id, actor, { fields: Object.keys(dto) });
    return saved;
  }

  async remove(id: string, actor: RequestUser): Promise<{ id: string; deleted: true }> {
    if (actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Only Principal Admin may delete companies');
    }
    const company = await this.repo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    await this.repo.softRemove(company);
    this.auditFor('company.delete', id, actor, { legalName: company.legalName });
    return { id, deleted: true };
  }

  private async assertReadable(company: Company, actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) return;
    const acting = await this.loadActingUser(actor.userId);
    if (!acting.companyId) throw new ForbiddenException('User has no company');

    // Own company always readable.
    if (company.id === acting.companyId) return;

    // Client + Client Admin can read their subcontractors.
    if (
      (actor.role === Role.CLIENT || actor.role === Role.CLIENT_ADMIN) &&
      company.parentCompanyId === acting.companyId
    ) {
      return;
    }
    throw new ForbiddenException('Cannot access this company');
  }

  private async assertWritable(company: Company, actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) return;
    const acting = await this.loadActingUser(actor.userId);
    if (!acting.companyId) throw new ForbiddenException('User has no company');

    // Client Admin: own company OR its subcontractors.
    if (actor.role === Role.CLIENT_ADMIN) {
      if (company.id === acting.companyId) return;
      if (company.parentCompanyId === acting.companyId) return;
    }
    // Client: own company only.
    if (actor.role === Role.CLIENT && company.id === acting.companyId) return;

    throw new ForbiddenException('Cannot modify this company');
  }
}
