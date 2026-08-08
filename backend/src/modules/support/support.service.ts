import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/support.dto';
import { Role } from '../../common/roles';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectRepository(SupportTicket) private readonly repo: Repository<SupportTicket>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateTicketDto, actor: RequestUser) {
    const ticket = await this.repo.save(this.repo.create({
      userId: actor.userId,
      subject: dto.subject,
      body: dto.body,
      status: 'open',
    }));

    // Notify every Principal Admin so someone picks it up.
    try {
      const admins = await this.users.find({ where: { role: Role.PRINCIPAL_ADMIN, isActive: true } });
      await Promise.all(admins.map((a) => this.notifications.create({
        userId: a.id,
        kind: 'invite', // reuse an existing kind literal to avoid a schema change
        title: 'Nuevo ticket de soporte',
        body: `${actor.email}: ${dto.subject}`,
        link: `/dashboard/principal-admin/support`,
      })));
    } catch (e: any) {
      this.logger.error(`Failed to notify admins about new ticket: ${e?.message ?? e}`);
    }

    return ticket;
  }

  async listMine(actor: RequestUser) {
    return this.repo.find({
      where: { userId: actor.userId },
      order: { createdAt: 'DESC' },
    });
  }

  async listAll(actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN) throw new ForbiddenException('Admins only');
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }

  async update(id: string, dto: UpdateTicketDto, actor: RequestUser) {
    const ticket = await this.repo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (actor.role !== Role.PRINCIPAL_ADMIN) throw new ForbiddenException('Admins only');

    if (dto.status) {
      ticket.status = dto.status;
      if (dto.status === 'resolved' || dto.status === 'closed') {
        ticket.resolvedAt = new Date();
      } else {
        ticket.resolvedAt = null;
      }
    }
    return this.repo.save(ticket);
  }
}
