import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CourseModule } from './course-module.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpsertModulesDto } from './dto/upsert-modules.dto';
import { AuditService, AuditEntry } from '../audit/audit.service';
import { Role } from '../../common/roles';

export interface RequestUser { userId: string; email: string; role: Role }

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private readonly repo: Repository<Course>,
    @InjectRepository(CourseModule) private readonly modules: Repository<CourseModule>,
    private readonly audit: AuditService,
  ) {}

  private auditFor(action: string, entityId: string, actor: RequestUser | undefined, metadata?: Record<string, unknown>): Promise<void> | void {
    if (!actor) return;
    const entry: AuditEntry = {
      actorId: actor.userId,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      entityType: 'course',
      entityId,
      metadata: metadata ?? null,
    };
    return this.audit.record(entry);
  }

  listModules(courseId: string) {
    return this.modules.find({ where: { courseId }, order: { position: 'ASC' } });
  }

  async replaceModules(courseId: string, dto: UpsertModulesDto) {
    const course = await this.repo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    await this.modules.delete({ courseId });
    if (dto.modules.length === 0) return [];
    const entities = dto.modules.map((m, i) => this.modules.create({
      courseId,
      position: m.position ?? i + 1,
      titleEs: m.titleEs,
      titleEn: m.titleEn ?? null,
      contentType: m.contentType,
      contentUrl: m.contentUrl ?? null,
      contentBody: m.contentBody ?? null,
      durationMin: m.durationMin ?? null,
    }));
    await this.modules.save(entities);
    return this.listModules(courseId);
  }

  async create(dto: CreateCourseDto, actor?: RequestUser): Promise<Course> {
    const exists = await this.repo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Slug already in use');
    const c = this.repo.create({ ...dto, isPublished: dto.isPublished ?? false });
    const saved = await this.repo.save(c);
    this.auditFor('course.create', saved.id, actor, { slug: saved.slug, titleEs: saved.titleEs });
    return saved;
  }

  listAll(): Promise<Course[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  listPublished(): Promise<Course[]> {
    return this.repo.find({ where: { isPublished: true }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Course> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }

  async findBySlug(slug: string): Promise<Course> {
    const c = await this.repo.findOne({ where: { slug } });
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }

  async update(id: string, dto: UpdateCourseDto, actor?: RequestUser): Promise<Course> {
    const c = await this.findOne(id);
    const wasPublished = c.isPublished;
    Object.assign(c, dto);
    const saved = await this.repo.save(c);
    this.auditFor('course.update', saved.id, actor, { fields: Object.keys(dto) });
    if (dto.isPublished !== undefined && dto.isPublished !== wasPublished) {
      this.auditFor(dto.isPublished ? 'course.publish' : 'course.unpublish', saved.id, actor, { slug: saved.slug });
    }
    return saved;
  }

  async remove(id: string, actor?: RequestUser): Promise<{ id: string; deleted: true }> {
    const c = await this.findOne(id);
    await this.repo.softRemove(c);
    this.auditFor('course.delete', id, actor, { slug: c.slug, titleEs: c.titleEs });
    return { id, deleted: true };
  }
}
