import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrainingService, RequestUser } from './training.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';

@ApiTags('training')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly svc: TrainingService) {}

  @ApiOperation({ summary: 'List training sessions (scoped by role)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.CAPACITADOR)
  @Get('sessions')
  listSessions(@Req() req: any) {
    return this.svc.listSessions(req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Create a training session' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.CAPACITADOR)
  @Post('sessions')
  createSession(@Body() dto: CreateSessionDto, @Req() req: any) {
    return this.svc.createSession(dto, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Update a training session' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.CAPACITADOR)
  @Patch('sessions/:id')
  updateSession(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSessionDto,
    @Req() req: any,
  ) {
    return this.svc.updateSession(id, dto, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'List appointments (assigned)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR, Role.CAPACITADOR)
  @Get('appointments')
  listAppointments(@Req() req: any) {
    return this.svc.listAppointments(req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Update appointment (confirm/cancel/complete)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR, Role.CAPACITADOR)
  @Patch('appointments/:id')
  updateAppointment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    return this.svc.updateAppointment(id, dto, req.user as RequestUser);
  }

  @ApiOperation({ summary: "Get current trainer's profile" })
  @Roles(Role.CAPACITADOR, Role.PRINCIPAL_ADMIN)
  @Get('trainer-profile/me')
  myProfile(@Req() req: any) {
    return this.svc.getMyTrainerProfile(req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Get trainer profile by user id' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.CAPACITADOR)
  @Get('trainer-profile/:userId')
  getProfile(@Param('userId', new ParseUUIDPipe()) userId: string, @Req() req: any) {
    return this.svc.getTrainerProfile(userId, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Update trainer profile (admin or self)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.CAPACITADOR)
  @Patch('trainer-profile/:userId')
  updateProfile(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateTrainerProfileDto,
    @Req() req: any,
  ) {
    return this.svc.updateTrainerProfile(userId, dto, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Capacitador KPI dashboard summary' })
  @Roles(Role.CAPACITADOR, Role.PRINCIPAL_ADMIN)
  @Get('dashboard/summary')
  dashboardSummary(@Req() req: any) {
    return this.svc.dashboardSummary(req.user as RequestUser);
  }
}
