import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CourseModule } from './course-module.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpsertModulesDto } from './dto/upsert-modules.dto';
import { AuditService, AuditEntry } from '../audit/audit.service';
import { Role } from '../../common/roles';
import { COURSE_SEED } from './courses.seed';

export interface RequestUser { userId: string; email: string; role: Role }

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

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

  private slugify(code: string): string {
    return code
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Merge the "new" DTO shape (code/title/hours/price/...) into the entity,
   * while also populating the legacy columns for backwards compatibility.
   */
  private mergeDto(target: Partial<Course>, dto: CreateCourseDto | UpdateCourseDto): Partial<Course> {
    const d = dto as CreateCourseDto & UpdateCourseDto;
    if (d.code !== undefined) {
      target.code = d.code;
      if (!d.slug) target.slug = this.slugify(d.code);
    }
    if (d.slug !== undefined) target.slug = d.slug;
    if (d.title !== undefined) {
      target.title = d.title;
      if (d.titleEs === undefined) target.titleEs = d.title;
    }
    if (d.titleEs !== undefined) target.titleEs = d.titleEs;
    if (d.titleEn !== undefined) target.titleEn = d.titleEn;
    if (d.description !== undefined) {
      target.description = d.description;
      if (d.descriptionEs === undefined) target.descriptionEs = d.description;
    }
    if (d.descriptionEs !== undefined) target.descriptionEs = d.descriptionEs;
    if (d.descriptionEn !== undefined) target.descriptionEn = d.descriptionEn;
    if (d.nomReference !== undefined) target.nomReference = d.nomReference;
    if (d.hours !== undefined) {
      target.hours = d.hours;
      if (d.durationHours === undefined) target.durationHours = d.hours;
    }
    if (d.durationHours !== undefined) target.durationHours = d.durationHours;
    if (d.price !== undefined) {
      target.price = d.price;
      if (d.priceMxn === undefined) target.priceMxn = d.price;
    }
    if (d.priceMxn !== undefined) target.priceMxn = d.priceMxn;
    if (d.industry !== undefined) target.industry = d.industry;
    if (d.tier !== undefined) target.tier = d.tier;
    if (d.imageUrl !== undefined) target.imageUrl = d.imageUrl;
    if (d.isActive !== undefined) target.isActive = d.isActive;
    if (d.isPublished !== undefined) target.isPublished = d.isPublished;
    if (d.validityMonths !== undefined) target.validityMonths = d.validityMonths;
    return target;
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
    const code = dto.code;
    if (code) {
      // Reuse any soft-deleted row with the same code so we don't collide
      // with the unique index on the deleted row.
      const existing = await this.repo.findOne({ where: { code }, withDeleted: true });
      if (existing) {
        if (!existing.deletedAt) {
          throw new ConflictException('Course code already in use');
        }
        // Restore soft-deleted row and overwrite it with the new payload
        existing.deletedAt = null as any;
        existing.isPublished = dto.isPublished ?? false;
        existing.isActive = dto.isActive ?? true;
        this.mergeDto(existing, dto);
        const restored = await this.repo.save(existing);
        this.auditFor('course.create', restored.id, actor, { code: restored.code, slug: restored.slug, title: restored.title, restored: true });
        return restored;
      }
    }
    const slug = dto.slug || (code ? this.slugify(code) : undefined);
    if (slug) {
      const slugExisting = await this.repo.findOne({ where: { slug }, withDeleted: true });
      if (slugExisting) {
        if (!slugExisting.deletedAt) {
          throw new ConflictException('Slug already in use');
        }
        slugExisting.deletedAt = null as any;
        slugExisting.isPublished = dto.isPublished ?? false;
        slugExisting.isActive = dto.isActive ?? true;
        this.mergeDto(slugExisting, dto);
        const restored = await this.repo.save(slugExisting);
        this.auditFor('course.create', restored.id, actor, { code: restored.code, slug: restored.slug, title: restored.title, restored: true });
        return restored;
      }
    }
    const partial: Partial<Course> = { isPublished: dto.isPublished ?? false, isActive: dto.isActive ?? true };
    this.mergeDto(partial, dto);
    const entity = this.repo.create(partial);
    const saved = await this.repo.save(entity);
    this.auditFor('course.create', saved.id, actor, { code: saved.code, slug: saved.slug, title: saved.title });
    return saved;
  }

  listAll(): Promise<Course[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Public catalog list. Returns all active courses.
   */
  listActive(): Promise<Course[]> {
    return this.repo.find({ where: { isActive: true }, order: { createdAt: 'ASC' } });
  }

  listPublished(): Promise<Course[]> {
    // Public marketing endpoint — filter by isActive (canonical) OR isPublished (legacy).
    return this.repo
      .createQueryBuilder('c')
      .where('c.is_active = :active', { active: true })
      .orWhere('c.is_published = :pub', { pub: true })
      .orderBy('c.created_at', 'ASC')
      .getMany();
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

  async findByCode(code: string): Promise<Course> {
    const c = await this.repo.findOne({ where: { code } });
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }

  async update(id: string, dto: UpdateCourseDto, actor?: RequestUser): Promise<Course> {
    const c = await this.findOne(id);
    if (dto.code && dto.code !== c.code) {
      const clash = await this.repo.findOne({ where: { code: dto.code } });
      if (clash && clash.id !== id) throw new ConflictException('Course code already in use');
    }
    const wasPublished = c.isPublished;
    const wasActive = c.isActive;
    this.mergeDto(c, dto);
    const saved = await this.repo.save(c);
    this.auditFor('course.update', saved.id, actor, { fields: Object.keys(dto) });
    if (dto.isPublished !== undefined && dto.isPublished !== wasPublished) {
      this.auditFor(dto.isPublished ? 'course.publish' : 'course.unpublish', saved.id, actor, { code: saved.code });
    }
    if (dto.isActive !== undefined && dto.isActive !== wasActive) {
      this.auditFor(dto.isActive ? 'course.activate' : 'course.deactivate', saved.id, actor, { code: saved.code });
    }
    return saved;
  }

  /**
   * Soft-delete: mark inactive. Also triggers TypeORM softRemove so
   * deleted_at is stamped and legacy queries filter correctly.
   */
  async remove(id: string, actor?: RequestUser): Promise<{ id: string; deleted: true }> {
    const c = await this.findOne(id);
    c.isActive = false;
    await this.repo.save(c);
    await this.repo.softRemove(c);
    this.auditFor('course.delete', id, actor, { code: c.code, slug: c.slug });
    return { id, deleted: true };
  }

  /**
   * Seed the 24 default PROCHECK courses if the courses table is empty.
   * Safe to call repeatedly — will no-op on non-empty tables.
   */
  async seedIfEmpty(): Promise<{ seeded: number }> {
    try {
      const count = await this.repo.count();
      if (count > 0) return { seeded: 0 };
      this.logger.log('Courses table empty — seeding 24 default PROCHECK courses');
      const entities = COURSE_SEED.map((c) => {
        const partial: Partial<Course> = {
          isActive: true,
          isPublished: true,
        };
        this.mergeDto(partial, {
          code: c.code,
          title: c.title,
          description: c.description,
          hours: c.hours,
          price: c.price,
          industry: c.industry,
          tier: c.tier,
          imageUrl: c.image,
        } as CreateCourseDto);
        return this.repo.create(partial);
      });
      const saved = await this.repo.save(entities);
      this.logger.log(`Seeded ${saved.length} courses`);
      return { seeded: saved.length };
    } catch (err) {
      this.logger.warn(`Course seed skipped: ${(err as Error).message}`);
      return { seeded: 0 };
    }
  }

  /**
   * Seed 5 default modules (Intro, Marco Legal, Contenido Técnico, Casos,
   * Examen Final) for every course that has no modules yet.
   * Safe to call repeatedly.
   */
  async seedModulesIfEmpty(): Promise<{ coursesSeeded: number; modulesCreated: number }> {
    try {
      const { DEFAULT_MODULE_TEMPLATE } = await import('./course-modules.seed');
      const allCourses = await this.repo.find();
      let coursesSeeded = 0;
      let modulesCreated = 0;
      for (const c of allCourses) {
        const existing = await this.modules.count({ where: { courseId: c.id } });
        if (existing > 0) continue;
        const code = c.code || c.slug;
        const title = c.title || c.titleEs || code;
        const entities = DEFAULT_MODULE_TEMPLATE.map((m) => this.modules.create({
          courseId: c.id,
          position: m.position,
          titleEs: m.titleTemplate.replace('{code}', code).replace('{title}', title),
          titleEn: null,
          contentType: m.contentType,
          contentUrl: null,
          contentBody: m.bodyTemplate.replace(/\{code\}/g, code).replace(/\{title\}/g, title),
          durationMin: m.durationMin,
        }));
        await this.modules.save(entities);
        coursesSeeded += 1;
        modulesCreated += entities.length;
      }
      if (coursesSeeded > 0) {
        this.logger.log(`Seeded ${modulesCreated} modules across ${coursesSeeded} courses`);
      }
      return { coursesSeeded, modulesCreated };
    } catch (err) {
      this.logger.warn(`Module seed skipped: ${(err as Error).message}`);
      return { coursesSeeded: 0, modulesCreated: 0 };
    }
  }
}
