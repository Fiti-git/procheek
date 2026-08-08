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
import { CompaniesService, RequestUser } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly svc: CompaniesService) {}

  @Roles(Role.PRINCIPAL_ADMIN, Role.CLIENT_ADMIN, Role.CLIENT)
  @Post()
  create(@Body() dto: CreateCompanyDto, @Req() req: any) {
    return this.svc.create(dto, req.user as RequestUser);
  }

  @Get()
  list(@Req() req: any) {
    return this.svc.list(req.user as RequestUser);
  }

  @Get(':id')
  get(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.findOne(id, req.user as RequestUser);
  }

  @Get(':id/subcontractors')
  subcontractors(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.listSubcontractors(id, req.user as RequestUser);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
    @Req() req: any,
  ) {
    return this.svc.update(id, dto, req.user as RequestUser);
  }

  @Roles(Role.PRINCIPAL_ADMIN)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.remove(id, req.user as RequestUser);
  }
}
