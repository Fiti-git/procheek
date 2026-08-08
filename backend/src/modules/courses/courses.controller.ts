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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpsertModulesDto } from './dto/upsert-modules.dto';
import { Put } from '@nestjs/common';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@Controller('courses')
export class CoursesController {
  constructor(private readonly svc: CoursesService) {}

  // Public catalog — no auth.
  @Get()
  list() {
    return this.svc.listPublished();
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
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
