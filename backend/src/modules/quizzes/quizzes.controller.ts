import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizzesService, RequestUser } from './quizzes.service';
import { UpsertQuizDto } from './dto/upsert-quiz.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@UseGuards(AuthGuard('jwt'))
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly svc: QuizzesService) {}

  // Admin — author/edit the quiz for a course.
  @UseGuards(RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Put()
  upsert(@Body() dto: UpsertQuizDto) {
    return this.svc.upsert(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Get('admin/by-course/:courseId')
  adminGet(@Param('courseId', new ParseUUIDPipe()) courseId: string) {
    return this.svc.findByCourseAdmin(courseId);
  }

  // Learner — get quiz (no correct answers) + submit attempt.
  @Get('by-course/:courseId')
  learnerGet(@Param('courseId', new ParseUUIDPipe()) courseId: string, @Req() req: any) {
    return this.svc.findByCourseForLearner(courseId, req.user as RequestUser);
  }

  @Post(':id/attempts')
  submit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SubmitAttemptDto,
    @Req() req: any,
  ) {
    return this.svc.submitAttempt(id, dto, req.user as RequestUser);
  }
}
