import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { ModuleCompletion } from './module-completion.entity';
import { VideoWatch } from './video-watch.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ReportWatchDto } from './dto/report-watch.dto';
import { Role } from '../../common/roles';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
import { CourseModule } from '../courses/course-module.entity';
import { CertificatesService } from '../certificates/certificates.service';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private readonly repo: Repository<Enrollment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(CourseModule) private readonly modules: Repository<CourseModule>,
    @InjectRepository(ModuleCompletion) private readonly completions: Repository<ModuleCompletion>,
    @InjectRepository(VideoWatch) private readonly watches: Repository<VideoWatch>,
    private readonly certificates: CertificatesService,
  ) {}

  async getVideoWatch(enrollmentId: string, moduleId: string, actor: RequestUser) {
    const enr = await this.repo.findOne({ where: { id: enrollmentId } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot access');
    }
    return this.watches.findOne({ where: { enrollmentId, moduleId } });
  }

  async reportVideoWatch(
    enrollmentId: string,
    moduleId: string,
    dto: ReportWatchDto,
    actor: RequestUser,
  ) {
    const enr = await this.repo.findOne({ where: { id: enrollmentId } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot update');
    }
    const module = await this.modules.findOne({ where: { id: moduleId, courseId: enr.courseId } });
    if (!module) throw new NotFoundException('Module not part of this course');

    let watch = await this.watches.findOne({ where: { enrollmentId, moduleId } });
    if (!watch) {
      watch = this.watches.create({
        enrollmentId,
        moduleId,
        positionSec: dto.positionSec,
        maxPositionSec: dto.positionSec,
        durationSec: dto.durationSec ?? null,
      });
    } else {
      watch.positionSec = dto.positionSec;
      if (dto.positionSec > watch.maxPositionSec) watch.maxPositionSec = dto.positionSec;
      if (dto.durationSec != null) watch.durationSec = dto.durationSec;
    }
    await this.watches.save(watch);

    // Auto-complete the module when the learner has reached ≥ 90% of the video.
    let autoCompleted = false;
    if (watch.durationSec && watch.durationSec > 0 && watch.maxPositionSec / watch.durationSec >= 0.9) {
      const already = await this.completions.findOne({ where: { enrollmentId, moduleId } });
      if (!already) {
        await this.completions.save(this.completions.create({ enrollmentId, moduleId }));
        autoCompleted = true;

        const allModules = await this.modules.find({ where: { courseId: enr.courseId } });
        const done = await this.completions.count({ where: { enrollmentId } });
        const totalModules = allModules.length;
        const pct = totalModules > 0 ? Math.round((done / totalModules) * 100) : 100;
        if (pct > enr.progressPct) {
          enr.progressPct = Math.min(99, pct);
          await this.repo.save(enr);
        }
      }
    }

    return {
      positionSec: watch.positionSec,
      maxPositionSec: watch.maxPositionSec,
      durationSec: watch.durationSec,
      watchedPct: watch.durationSec
        ? Math.round((watch.maxPositionSec / watch.durationSec) * 100)
        : null,
      autoCompleted,
      progressPct: enr.progressPct,
    };
  }

  async listMyCompletions(enrollmentId: string, actor: RequestUser) {
    const enr = await this.repo.findOne({ where: { id: enrollmentId } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot access');
    }
    return this.completions.find({ where: { enrollmentId }, order: { completedAt: 'ASC' } });
  }

  async completeModule(enrollmentId: string, moduleId: string, actor: RequestUser) {
    const enr = await this.repo.findOne({ where: { id: enrollmentId } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot update this enrollment');
    }
    const module = await this.modules.findOne({ where: { id: moduleId, courseId: enr.courseId } });
    if (!module) throw new NotFoundException('Module not part of this course');

    const existing = await this.completions.findOne({ where: { enrollmentId, moduleId } });
    if (!existing) {
      await this.completions.save(this.completions.create({ enrollmentId, moduleId }));
    }

    const allModules = await this.modules.find({ where: { courseId: enr.courseId } });
    const done = await this.completions.count({ where: { enrollmentId } });
    const totalModules = allModules.length;
    const pctFromModules = totalModules > 0 ? Math.round((done / totalModules) * 100) : 100;

    // Only bump; never regress. Never auto-complete the enrollment here — quiz gates that.
    if (pctFromModules > enr.progressPct) {
      enr.progressPct = Math.min(99, pctFromModules); // quiz still needed to hit 100
      await this.repo.save(enr);
    }
    return {
      enrollmentId: enr.id,
      moduleId,
      modulesCompleted: done,
      totalModules,
      progressPct: enr.progressPct,
    };
  }

  async create(dto: CreateEnrollmentDto, actor: RequestUser): Promise<Enrollment> {
    const course = await this.courses.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.isPublished && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new BadRequestException('Course is not available for enrollment');
    }

    const targetUserId = dto.userId ?? actor.userId;

    // Only admins/company admins may enroll someone else.
    if (targetUserId !== actor.userId) {
      if (![Role.PRINCIPAL_ADMIN, Role.CLIENT_ADMIN, Role.CLIENT].includes(actor.role)) {
        throw new ForbiddenException('Cannot enroll another user');
      }
      const target = await this.users.findOne({ where: { id: targetUserId } });
      if (!target) throw new NotFoundException('User not found');

      // Company admin/client can only enroll users in their own company (or its subcontractors).
      if (actor.role !== Role.PRINCIPAL_ADMIN) {
        const acting = await this.users.findOne({ where: { id: actor.userId } });
        if (!acting?.companyId) throw new ForbiddenException('User has no company');
        // Allowed if target belongs to same company (parent-child handled at company scope elsewhere).
        if (target.companyId !== acting.companyId) {
          throw new ForbiddenException('Cannot enroll user outside your company');
        }
      }
    }

    // Look for any existing enrollment. If an ACTIVE one exists, block —
    // an active enrollment must be finished (or cancelled) before starting again.
    // If the most recent one is COMPLETED, allow re-enrollment as a recertification.
    const existing = await this.repo.find({
      where: { userId: targetUserId, courseId: dto.courseId },
      order: { enrolledAt: 'DESC' },
    });
    const activeOne = existing.find((e) => e.status === 'active');
    if (activeOne) {
      throw new ConflictException('Already enrolled in this course');
    }
    const previous = existing[0] ?? null; // may be completed / expired / cancelled

    const target = await this.users.findOne({ where: { id: targetUserId } });
    const entity = this.repo.create({
      userId: targetUserId,
      courseId: dto.courseId,
      companyId: target?.companyId ?? null,
      status: 'active',
      progressPct: 0,
      recertificationOf: previous?.status === 'completed' ? previous.id : null,
    });
    return this.repo.save(entity);
  }

  listMine(actor: RequestUser): Promise<Enrollment[]> {
    return this.repo.find({ where: { userId: actor.userId }, order: { enrolledAt: 'DESC' } });
  }

  async bulkAssign(
    courseId: string,
    userIds: string[],
    actor: RequestUser,
  ): Promise<{ courseId: string; assigned: number; skipped: number; enrollmentIds: string[] }> {
    if (userIds.length === 0) throw new BadRequestException('userIds is empty');

    const course = await this.courses.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    // Scope: same rules as single-user enroll.
    let allowedIds = userIds;
    if (actor.role !== Role.PRINCIPAL_ADMIN) {
      if (![Role.CLIENT_ADMIN, Role.CLIENT].includes(actor.role)) {
        throw new ForbiddenException('Cannot bulk-assign');
      }
      const acting = await this.users.findOne({ where: { id: actor.userId } });
      if (!acting?.companyId) throw new ForbiddenException('User has no company');
      const targets = await this.users.find({ where: { id: In(userIds) } });
      allowedIds = targets
        .filter((u) => u.companyId === acting.companyId)
        .map((u) => u.id);
      if (allowedIds.length === 0) {
        throw new ForbiddenException('None of the users are in your company');
      }
    }

    const created: string[] = [];
    let skipped = 0;
    for (const uid of allowedIds) {
      const already = await this.repo.findOne({ where: { userId: uid, courseId, status: 'active' } });
      if (already) { skipped++; continue; }
      const target = await this.users.findOne({ where: { id: uid } });
      if (!target) { skipped++; continue; }
      // Link to prior completed enrollment as a recert if present.
      const prior = await this.repo.findOne({
        where: { userId: uid, courseId, status: 'completed' },
        order: { enrolledAt: 'DESC' },
      });
      const enr = await this.repo.save(this.repo.create({
        userId: uid,
        courseId,
        companyId: target.companyId ?? null,
        status: 'active',
        progressPct: 0,
        recertificationOf: prior?.id ?? null,
      }));
      created.push(enr.id);
    }
    return { courseId, assigned: created.length, skipped, enrollmentIds: created };
  }

  async list(actor: RequestUser): Promise<Enrollment[]> {
    if (actor.role === Role.PRINCIPAL_ADMIN) {
      return this.repo.find({ order: { enrolledAt: 'DESC' } });
    }
    if (actor.role === Role.CLIENT || actor.role === Role.CLIENT_ADMIN) {
      const acting = await this.users.findOne({ where: { id: actor.userId } });
      if (!acting?.companyId) return [];
      // Own company + subcontractor employees' enrollments.
      const memberIds = await this.users
        .createQueryBuilder('u')
        .select('u.id')
        .where('u.company_id = :cid', { cid: acting.companyId })
        .getRawMany();
      const ids = memberIds.map((r) => r.u_id);
      if (ids.length === 0) return [];
      return this.repo.find({ where: { userId: In(ids) }, order: { enrolledAt: 'DESC' } });
    }
    return this.listMine(actor);
  }

  async updateProgress(id: string, dto: UpdateProgressDto, actor: RequestUser): Promise<Enrollment> {
    const enr = await this.repo.findOne({ where: { id } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot update this enrollment');
    }
    const wasCompleted = enr.status === 'completed';
    enr.progressPct = dto.progressPct;
    if (dto.markCompleted || dto.progressPct >= 100) {
      enr.status = 'completed';
      enr.completedAt = new Date();
      enr.progressPct = 100;
    }
    const saved = await this.repo.save(enr);
    if (!wasCompleted && saved.status === 'completed') {
      // Fire-and-forget issue; failure shouldn't roll back the progress update.
      this.certificates.issueForEnrollment(saved.id).catch(() => undefined);
    }
    return saved;
  }

  async cancel(id: string, actor: RequestUser): Promise<{ id: string; cancelled: true }> {
    const enr = await this.repo.findOne({ where: { id } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot cancel this enrollment');
    }
    enr.status = 'cancelled';
    await this.repo.save(enr);
    return { id, cancelled: true };
  }

  async recertify(id: string, actor: RequestUser) {
    const enr = await this.repo.findOne({ where: { id } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Cannot recertify this enrollment');
    }
    if (enr.status !== 'completed') {
      throw new BadRequestException('Only completed enrollments can be recertified');
    }

    // If an active recert enrollment already exists for this course, return it.
    const existingActive = await this.repo.findOne({
      where: { userId: enr.userId, courseId: enr.courseId, status: 'active' },
    });
    if (existingActive) {
      return {
        id: existingActive.id,
        status: existingActive.status,
        progressPct: existingActive.progressPct,
        recertificationOf: existingActive.recertificationOf,
        message: 'Recertification already in progress',
      };
    }

    const fresh = await this.repo.save(this.repo.create({
      userId: enr.userId,
      courseId: enr.courseId,
      companyId: enr.companyId,
      status: 'active',
      progressPct: 0,
      recertificationOf: enr.id,
    }));

    return {
      id: fresh.id,
      status: fresh.status,
      progressPct: fresh.progressPct,
      recertificationOf: fresh.recertificationOf,
      message: 'Recertification started — a new enrollment was created linked to the previous one',
    };
  }
}
