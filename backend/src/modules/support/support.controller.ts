import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService, RequestUser } from './support.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/support.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@UseGuards(AuthGuard('jwt'))
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly svc: SupportService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @Req() req: any) {
    return this.svc.create(dto, req.user as RequestUser);
  }

  @Get('me')
  mine(@Req() req: any) {
    return this.svc.listMine(req.user as RequestUser);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Get()
  listAll(@Req() req: any) {
    return this.svc.listAll(req.user as RequestUser);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTicketDto,
    @Req() req: any,
  ) {
    return this.svc.update(id, dto, req.user as RequestUser);
  }
}
