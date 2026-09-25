import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpsertModulesDto } from './dto/upsert-modules.dto';
import { Put } from '@nestjs/common';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';
import { Course } from './course.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CertificatesService } from '../certificates/certificates.service';
import { getQuizForCode, toPublicQuiz, GENERIC_QUIZ } from './quiz-bank';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly svc: CoursesService,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
    private readonly certificates: CertificatesService,
  ) {}

  // Public: fixed 10-question quiz for a course. `correctIndex` is stripped.
  @Get(':id/quiz')
  async getQuiz(@Param('id', new ParseUUIDPipe()) id: string) {
    const course = await this.courses.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return toPublicQuiz(getQuizForCode(course.code));
  }

  // Authenticated: submit answers, get score. Passing (≥90%) sets
  // enrollment.progressPct to 100 which triggers auto-cert issuance.
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/quiz/submit')
  async submitQuiz(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { answers?: Record<string, number> },
    @Req() req: any,
  ) {
    const course = await this.courses.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    const bank = getQuizForCode(course.code);
    const answers = body?.answers ?? {};

    let correct = 0;
    const wrongQuestions: string[] = [];
    for (const q of bank) {
      const chosen = answers[q.id];
      if (typeof chosen === 'number' && chosen === q.correctIndex) {
        correct += 1;
      } else {
        wrongQuestions.push(q.id);
      }
    }
    const total = bank.length || GENERIC_QUIZ.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= 90;

    if (passed) {
      const actor = req.user as { userId: string };
      // Find the learner's active (or most recent) enrollment for this course.
      const enr = await this.enrollments.findOne({
        where: { userId: actor.userId, courseId: id },
        order: { enrolledAt: 'DESC' },
      });
      if (enr) {
        enr.progressPct = 100;
        enr.status = 'completed';
        enr.completedAt = enr.completedAt ?? new Date();
        await this.enrollments.save(enr);
        // Trigger cert issuance (dedupes internally). Never block the response.
        try {
          await this.certificates.issueForEnrollment(enr.id);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(`[quiz] cert issue failed for enrollment ${enr.id}:`, (err as Error)?.message ?? err);
        }
      }
    }

    return { score, passed, correct, total, wrongQuestions };
  }

  // Public catalog — no auth. Returns all active courses.
  @Get()
  list() {
    return this.svc.listActive();
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get('code/:code')
  getByCode(@Param('code') code: string) {
    return this.svc.findByCode(code);
  }

  // Admin — protected.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Get('admin/all')
  listAll() {
    return this.svc.listAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Post()
  create(@Body() dto: CreateCourseDto, @Req() req: any) {
    return this.svc.create(dto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCourseDto, @Req() req: any) {
    return this.svc.update(id, dto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.remove(id, req.user);
  }

  @Get(':id')
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.findOne(id);
  }

  // Public — modules of a course.
  @Get(':id/modules')
  listModules(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.listModules(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Put(':id/modules')
  upsertModules(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpsertModulesDto,
  ) {
    return this.svc.replaceModules(id, dto);
  }
}
