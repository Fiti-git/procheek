import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEmail as IsEmailValidator, IsOptional } from 'class-validator';
import { CertificatesService, RequestUser } from './certificates.service';
import { renderCertificatePdf } from './pdf';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { AdminIssueCertDto, RevokeCertDto } from './dto/admin-cert.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

class EmailCertDto {
  @IsOptional() @IsEmailValidator()
  to?: string;
}

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly svc: CertificatesService,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // Public lookup — no auth.
  @Get('lookup/:code')
  lookup(@Param('code') code: string) {
    return this.svc.lookup(code);
  }

  // Public PDF by verification code — safe to share.
  @Get('lookup/:code/pdf')
  async pdfByCode(@Param('code') code: string, @Res() res: Response) {
    const cert = await this.svc.findByCode(code);
    if (!cert) throw new NotFoundException('Certificate not found');
    await this.stream(cert.id, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  mine(@Req() req: any) {
    return this.svc.listMine(req.user as RequestUser);
  }

  // Admin — list all certs across the platform.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Get('admin/all')
  listAllAdmin() {
    return this.svc.listAll();
  }

  // Admin — manually issue a certificate.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Post('admin/issue')
  adminIssue(@Body() dto: AdminIssueCertDto, @Req() req: any) {
    return this.svc.adminIssue({
      enrollmentId: dto.enrollmentId,
      userId: dto.userId,
      courseId: dto.courseId,
      dc3Folio: dto.dc3Folio,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    }, req.user as RequestUser);
  }

  // Admin — update certificate (folio / expiry).
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Patch(':id')
  adminUpdate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { dc3Folio?: string | null; expiresAt?: string | null },
    @Req() req: any,
  ) {
    return this.svc.updateAdmin(
      id,
      {
        dc3Folio: body.dc3Folio,
        expiresAt:
          body.expiresAt === null
            ? null
            : body.expiresAt !== undefined
              ? new Date(body.expiresAt)
              : undefined,
      },
      req.user as RequestUser,
    );
  }

  // Admin — revoke a certificate.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PRINCIPAL_ADMIN)
  @Post(':id/revoke')
  revoke(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: RevokeCertDto, @Req() req: any) {
    return this.svc.revoke(id, dto.reason ?? '', req.user as RequestUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/pdf')
  async pdfById(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const cert = await this.svc.findById(id);
    if (!cert) throw new NotFoundException('Certificate not found');
    const user = req.user as RequestUser;
    if (cert.userId !== user.userId && user.role !== 'principal_admin') {
      throw new NotFoundException('Certificate not found');
    }
    await this.stream(cert.id, res);
  }

  // Re-send the certificate PDF by email.
  // Accepts a UUID (cert id), a PC-XXXX-XXXX-XXXX verification code, or a DC-3 folio.
  // Owner or principal_admin only. Recipient defaults to the caller's own email.
  @UseGuards(AuthGuard('jwt'))
  @Post(':folio/email')
  async emailByFolio(
    @Param('folio') folio: string,
    @Body() dto: EmailCertDto,
    @Req() req: any,
  ) {
    const cert = await this.svc.findByFolio(folio);
    if (!cert) throw new NotFoundException('Certificate not found');
    const user = req.user as RequestUser;
    if (cert.userId !== user.userId && user.role !== 'principal_admin') {
      throw new ForbiddenException('Cannot email this certificate');
    }
    const to = dto.to ?? user.email;
    return this.svc.emailCertificateTo(cert, to);
  }

  private async stream(certId: string, res: Response) {
    const cert = await this.svc.findById(certId);
    if (!cert) throw new NotFoundException('Certificate not found');
    const [course, holder] = await Promise.all([
      this.courses.findOne({ where: { id: cert.courseId } }),
      this.users.findOne({ where: { id: cert.userId } }),
    ]);
    const origin = res.req.headers.origin || `http://${res.req.headers.host}`;
    const stream = renderCertificatePdf({
      code: cert.code,
      holder: holder ? `${holder.firstName} ${holder.lastName}` : '—',
      courseTitle: course?.titleEs ?? '—',
      nomReference: course?.nomReference ?? null,
      dc3Folio: cert.dc3Folio,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      revokedAt: cert.revokedAt,
      verifyUrl: `${origin}/certificate-lookup`,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificate-${cert.code}.pdf"`);
    stream.pipe(res);
  }
}
