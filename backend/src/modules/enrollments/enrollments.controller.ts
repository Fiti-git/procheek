import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EnrollmentsService, RequestUser } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ReportWatchDto } from './dto/report-watch.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly svc: EnrollmentsService) {}

  @Post()
  create(@Body() dto: CreateEnrollmentDto, @Req() req: any) {
    return this.svc.create(dto, req.user as RequestUser);
  }

  @Post('assign')
  bulkAssign(@Body() dto: BulkAssignDto, @Req() req: any) {
    return this.svc.bulkAssign(dto.courseId, dto.userIds, req.user as RequestUser);
  }

  // Sprint D alias: matches spec { course_id, user_ids }. Returns { enrolled, skipped }.
  @Post('bulk')
  async bulk(@Body() body: any, @Req() req: any) {
    const courseId = body.courseId ?? body.course_id;
    const userIds = body.userIds ?? body.user_ids ?? [];
    const res = await this.svc.bulkAssign(courseId, userIds, req.user as RequestUser);
    return { enrolled: res.assigned, skipped: res.skipped, enrollmentIds: res.enrollmentIds };
  }

  @Get('me')
  mine(@Req() req: any) {
    return this.svc.listMine(req.user as RequestUser);
  }

  @Get()
  list(@Req() req: any) {
    return this.svc.list(req.user as RequestUser);
  }

  @Patch(':id/progress')
  progress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProgressDto,
    @Req() req: any,
  ) {
    return this.svc.updateProgress(id, dto, req.user as RequestUser);
  }

  @Delete(':id')
  cancel(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.cancel(id, req.user as RequestUser);
  }

  @Post(':id/recertify')
  recertify(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.recertify(id, req.user as RequestUser);
  }

  @Get(':id/completions')
  completions(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.listMyCompletions(id, req.user as RequestUser);
  }

  @Post(':id/modules/:moduleId/complete')
  completeModule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Req() req: any,
  ) {
    return this.svc.completeModule(id, moduleId, req.user as RequestUser);
  }

  @Get(':id/modules/:moduleId/watch')
  getWatch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Req() req: any,
  ) {
    return this.svc.getVideoWatch(id, moduleId, req.user as RequestUser);
  }

  @Patch(':id/modules/:moduleId/watch')
  reportWatch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Body() dto: ReportWatchDto,
    @Req() req: any,
  ) {
    return this.svc.reportVideoWatch(id, moduleId, dto, req.user as RequestUser);
  }
}
