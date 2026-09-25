import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { User } from '../users/user.entity';

export interface AuditEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.repo.save(this.repo.create({
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        actorRole: entry.actorRole ?? null,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      }));
    } catch (e: any) {
      this.logger.warn(`Failed to write audit log: ${e?.message ?? e}`);
    }
  }

  async list(opts: { limit?: number; entityType?: string; entityId?: string; actorId?: string } = {}) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.created_at', 'DESC').limit(opts.limit ?? 200);
    if (opts.entityType) qb.andWhere('a.entity_type = :et', { et: opts.entityType });
    if (opts.entityId) qb.andWhere('a.entity_id = :ei', { ei: opts.entityId });
    if (opts.actorId) qb.andWhere('a.actor_id = :aid', { aid: opts.actorId });
    return qb.getMany();
  }

  /**
   * Company-scoped audit list — returns audit entries whose acting user
   * belongs to the caller's company (or the caller's own actions).
   */
  async listForCompany(callerUserId: string, limit = 100) {
    const caller = await this.users.findOne({ where: { id: callerUserId } });
    if (!caller?.companyId) return [];
    const members = await this.users.find({
      where: { companyId: caller.companyId },
      select: ['id'],
    });
    const ids = members.map((u) => u.id);
    if (ids.length === 0) return [];
    return this.repo
      .createQueryBuilder('a')
      .where('a.actor_id IN (:...ids)', { ids })
      .orderBy('a.created_at', 'DESC')
      .limit(Math.min(500, Math.max(1, limit)))
      .getMany();
  }
}
