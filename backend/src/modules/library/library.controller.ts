import {
  Body,
  Controller,
  Delete,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@ApiTags('Library')
@Controller('library')
export class LibraryController {
  constructor(private readonly svc: LibraryService) {}

  @Get('documents')
  list(@Query() query: ListQueryDto) {
    return this.svc.list(query);
  }

  @Get('documents/:id')
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Post('documents')
  create(@Body() dto: CreateDocumentDto, @Req() req: any) {
    return this.svc.create(dto, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Patch('documents/:id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.svc.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Delete('documents/:id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(id);
  }

  @Post('documents/:id/download')
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    // Optional JWT: if bearer present, decode it to associate the download.
    let userId: string | null = null;
    const auth = req.headers?.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = auth.slice(7);
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const decoded: any = jwt.verify(token, secret);
        userId = decoded?.sub || decoded?.userId || null;
      } catch {
        userId = null;
      }
    }
    const ip =
      (req.headers?.['x-forwarded-for'] as string) ||
      req.ip ||
      req.connection?.remoteAddress ||
      null;
    const userAgent = req.headers?.['user-agent'] || null;
    return this.svc.recordDownload(id, userId, { ip, userAgent });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('documents/:id/purchase')
  purchase(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.purchase(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('purchases/me')
  myPurchases(@Req() req: any) {
    return this.svc.myPurchases(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Get('stats')
  stats() {
    return this.svc.stats();
  }
}
