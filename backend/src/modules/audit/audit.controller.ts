import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.PRINCIPAL_ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get()
  list(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.list({
      entityType,
      entityId,
      actorId,
      limit: limit ? Math.min(500, Math.max(1, Number(limit))) : 200,
    });
  }
}
