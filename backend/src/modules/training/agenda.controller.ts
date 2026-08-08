import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrainingService, RequestUser } from './training.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@ApiTags('agenda')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly svc: TrainingService) {}

  @ApiOperation({ summary: 'Public list of bookable people with 3 next slots' })
  @Get('available')
  available(@Query('purpose') purpose: string = 'demo') {
    return this.svc.listAvailable(purpose);
  }

  @ApiOperation({ summary: 'Create an appointment (public or authenticated)' })
  @Post('appointments')
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.svc.createAppointment(dto);
  }

  @ApiOperation({ summary: 'Create an appointment (authenticated context)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('appointments/authenticated')
  createAppointmentAuthed(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    return this.svc.createAppointment(dto, req.user as RequestUser);
  }
}
