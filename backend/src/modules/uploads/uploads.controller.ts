import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly svc: UploadsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const u = await this.svc.save(file, req.user.userId);
    return {
      id: u.id,
      url: `/api/uploads/${u.id}`,
      originalName: u.originalName,
      mimeType: u.mimeType,
      sizeBytes: u.sizeBytes,
    };
  }

  // Public — serves the file inline.
  @Get(':id')
  async serve(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response) {
    const u = await this.svc.findById(id);
    res.setHeader('Content-Type', u.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(u.originalName)}"`);
    res.sendFile(this.svc.absolutePath(u));
  }
}
