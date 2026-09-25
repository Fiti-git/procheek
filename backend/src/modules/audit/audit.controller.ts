import { Controller, ForbiddenException, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  // Platform-wide audit — principal_admin only.
  // Company-scoped feed for client admins is exposed with `?scope=my-company`.
  @Roles(Role.PRINCIPAL_ADMIN, Role.CLIENT_ADMIN)
  @Get()
  list(
    @Req() req: any,
    @Query('scope') scope?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(500, Math.max(1, Number(limit))) : 200;
    if (scope === 'my-company') {
      return this.svc.listForCompany(req.user.userId, Math.min(parsedLimit, 100));
    }
    // Full/global feed requires principal_admin — client_admin without scope is denied.
    if (req.user.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('scope=my-company required');
    }
    return this.svc.list({
      entityType,
      entityId,
      actorId,
      limit: parsedLimit,
    });
  }
}
