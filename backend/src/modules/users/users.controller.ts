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
import { UsersService, RequestUser } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Roles(Role.PRINCIPAL_ADMIN, Role.CLIENT_ADMIN, Role.CLIENT, Role.SUBCONTRACTOR)
  @Post('invite')
  invite(@Body() dto: InviteUserDto, @Req() req: any) {
    return this.svc.invite(dto, req.user as RequestUser);
  }

  @Get()
  list(@Req() req: any) {
    return this.svc.list(req.user as RequestUser);
  }

  @Get('me')
  me(@Req() req: any) {
    return this.svc.findOneScoped((req.user as RequestUser).userId, req.user as RequestUser);
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto, @Req() req: any) {
    // Never allow self-role-escalation or self-deactivation via this endpoint.
    const safe: UpdateUserDto = { ...dto };
    delete safe.role;
    delete safe.isActive;
    return this.svc.update((req.user as RequestUser).userId, safe, req.user as RequestUser);
  }

  @Get(':id')
  get(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.findOneScoped(id, req.user as RequestUser);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.svc.update(id, dto, req.user as RequestUser);
  }

  @Delete(':id')
  deactivate(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.deactivate(id, req.user as RequestUser);
  }
}
