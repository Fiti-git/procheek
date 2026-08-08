import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { TrainerProfile } from './entities/trainer-profile.entity';
import { Appointment } from './entities/appointment.entity';
import { TrainingSession } from './entities/training-session.entity';
import { VendorProfile } from '../sales/entities/vendor-profile.entity';
import { User } from '../users/user.entity';
import { Role } from '../../common/roles';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainerProfile) private readonly trainers: Repository<TrainerProfile>,
    @InjectRepository(Appointment) private readonly appointments: Repository<Appointment>,
    @InjectRepository(TrainingSession) private readonly sessions: Repository<TrainingSession>,
    @InjectRepository(VendorProfile) private readonly vendors: Repository<VendorProfile>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // ============================================================
  // Public agenda
  // ============================================================
  async listAvailable(purpose: string) {
    const roles: Role[] =
      purpose === 'demo'
        ? [Role.VENDEDOR]
        : purpose === 'consulting' || purpose === 'training' || purpose === 'follow_up'
        ? [Role.CAPACITADOR, Role.VENDEDOR]
        : [Role.VENDEDOR, Role.CAPACITADOR];

    const users = await this.users.find({
      where: { role: In(roles) as any, isActive: true } as any,
    });

    const results: any[] = [];
    for (const u of users) {
      let specialties: string[] = [];
      let bio: string | null = null;
      let profileActive = true;
      if (u.role === Role.VENDEDOR) {
        const vp = await this.vendors.findOne({ where: { userId: u.id } });
        if (vp) {
          specialties = vp.specialties ?? [];
          bio = vp.bio;
          profileActive = vp.isActive;
        }
      } else if (u.role === Role.CAPACITADOR) {
        const tp = await this.trainers.findOne({ where: { userId: u.id } });
        if (tp) {
          specialties = tp.specialties ?? [];
          bio = tp.bio;
          profileActive = tp.isActive;
        }
      }
      if (!profileActive) continue;
      results.push({
        id: u.id,
        display_name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        role: u.role,
        specialties,
        bio,
        available_slots: this.nextAvailableSlots(),
      });
    }
    return results;
  }

  private nextAvailableSlots(): string[] {
    const slots: string[] = [];
    const now = new Date();
    let day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const hours = [10, 14, 16];
    let daysFound = 0;
    let i = 1;
    while (daysFound < 3 && i < 14) {
      const candidate = new Date(day);
      candidate.setUTCDate(day.getUTCDate() + i);
      const dow = candidate.getUTCDay();
      if (dow !== 0 && dow !== 6) {
        const h = hours[daysFound];
        candidate.setUTCHours(h, 0, 0, 0);
        slots.push(candidate.toISOString());
        daysFound++;
      }
      i++;
    }
    return slots;
  }

  async createAppointment(dto: CreateAppointmentDto, actor?: RequestUser) {
    if (dto.requester_kind !== 'public' && !actor) {
      throw new ForbiddenException('Authentication required for non-public request');
    }
    const assigned = await this.users.findOne({ where: { id: dto.assigned_user_id } });
    if (!assigned) throw new NotFoundException('Assigned user not found');
    if (assigned.role !== Role.VENDEDOR && assigned.role !== Role.CAPACITADOR) {
      throw new BadRequestException('Assigned user is not a vendedor or capacitador');
    }
    const appt = this.appointments.create({
      requesterKind: dto.requester_kind,
      requesterUserId: actor && dto.requester_kind !== 'public' ? actor.userId : null,
      requesterCompanyName: dto.requester_company_name ?? null,
      requesterContactName: dto.requester_contact_name,
      requesterEmail: dto.requester_email,
      requesterPhone: dto.requester_phone ?? null,
      assignedUserId: dto.assigned_user_id,
      assignedRole: assigned.role === Role.VENDEDOR ? 'vendedor' : 'capacitador',
      purpose: dto.purpose,
      scheduledAt: new Date(dto.scheduled_at),
      durationMin: dto.duration_min ?? 30,
      status: 'requested',
      notes: dto.notes ?? null,
    });
    return this.appointments.save(appt);
  }

  async listAppointments(actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return this.appointments.find({ order: { scheduledAt: 'DESC' } });
    }
    if (actor.role === Role.VENDEDOR || actor.role === Role.CAPACITADOR) {
      return this.appointments.find({
        where: { assignedUserId: actor.userId },
        order: { scheduledAt: 'DESC' },
      });
    }
    throw new ForbiddenException('Insufficient role');
  }

  async updateAppointment(id: string, dto: UpdateAppointmentDto, actor: RequestUser) {
    const a = await this.appointments.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Appointment not found');
    if (
      actor.role !== Role.PRINCIPAL_ADMIN &&
      a.assignedUserId !== actor.userId
    ) {
      throw new ForbiddenException('Cannot update this appointment');
    }
    Object.assign(a, dto);
    return this.appointments.save(a);
  }

  // ============================================================
  // Training sessions
  // ============================================================
  async listSessions(actor: RequestUser) {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return this.sessions.find({ order: { scheduledAt: 'DESC' } });
    }
    if (actor.role === Role.CAPACITADOR) {
      return this.sessions.find({
        where: { capacitadorId: actor.userId },
        order: { scheduledAt: 'DESC' },
      });
    }
    throw new ForbiddenException('Insufficient role');
  }

  async createSession(dto: CreateSessionDto, actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN && actor.role !== Role.CAPACITADOR) {
      throw new ForbiddenException('Capacitador or admin only');
    }
    let capacitadorId = actor.userId;
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      if (!dto.capacitadorId) throw new BadRequestException('capacitadorId required for admin');
      capacitadorId = dto.capacitadorId;
    }
    const s = this.sessions.create({
      capacitadorId,
      clientCompanyId: dto.clientCompanyId ?? null,
      courseId: dto.courseId ?? null,
      title: dto.title,
      scheduledAt: new Date(dto.scheduledAt),
      durationHours: dto.durationHours ?? null,
      attendeeCount: dto.attendeeCount ?? 0,
      location: dto.location ?? null,
      notes: dto.notes ?? null,
      status: 'scheduled',
    });
    return this.sessions.save(s);
  }

  async updateSession(id: string, dto: UpdateSessionDto, actor: RequestUser) {
    const s = await this.sessions.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Session not found');
    if (actor.role !== Role.PRINCIPAL_ADMIN && s.capacitadorId !== actor.userId) {
      throw new ForbiddenException('Cannot update this session');
    }
    Object.assign(s, {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : s.scheduledAt,
      deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : s.deliveredAt,
    });
    if (dto.status === 'delivered' && !s.deliveredAt) {
      s.deliveredAt = new Date();
    }
    return this.sessions.save(s);
  }

  // ============================================================
  // Trainer profile
  // ============================================================
  async getMyTrainerProfile(actor: RequestUser) {
    const p = await this.trainers.findOne({ where: { userId: actor.userId } });
    if (!p) throw new NotFoundException('Trainer profile not found');
    return p;
  }

  async getTrainerProfile(userId: string, actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN && actor.userId !== userId) {
      throw new ForbiddenException('Cannot access this profile');
    }
    const p = await this.trainers.findOne({ where: { userId } });
    if (!p) throw new NotFoundException('Trainer profile not found');
    return p;
  }

  async updateTrainerProfile(userId: string, dto: UpdateTrainerProfileDto, actor: RequestUser) {
    if (actor.role !== Role.PRINCIPAL_ADMIN && actor.userId !== userId) {
      throw new ForbiddenException('Cannot update this profile');
    }
    const p = await this.trainers.findOne({ where: { userId } });
    if (!p) throw new NotFoundException('Trainer profile not found');
    Object.assign(p, dto);
    return this.trainers.save(p);
  }

  // ============================================================
  // Dashboard
  // ============================================================
  async dashboardSummary(actor: RequestUser) {
    if (actor.role !== Role.CAPACITADOR && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Insufficient role');
    }
    const capacitadorId = actor.userId;
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const mtdSessions = await this.sessions.find({
      where: { capacitadorId, scheduledAt: Between(monthStart, monthEnd) },
    });
    const hoursDelivered = mtdSessions
      .filter((s) => s.status === 'delivered')
      .reduce((sum, s) => sum + Number(s.durationHours ?? 0), 0);
    const totalAttendees = mtdSessions.reduce((sum, s) => sum + (s.attendeeCount ?? 0), 0);
    const avgAttendees = mtdSessions.length > 0 ? totalAttendees / mtdSessions.length : 0;

    const upcoming = await this.appointments.count({
      where: [
        { assignedUserId: capacitadorId, status: 'requested' },
        { assignedUserId: capacitadorId, status: 'confirmed' },
      ],
    });

    return {
      sessions_this_month: mtdSessions.length,
      hours_delivered: Math.round(hoursDelivered * 100) / 100,
      upcoming_appointments: upcoming,
      avg_attendees: Math.round(avgAttendees * 10) / 10,
    };
  }
}
