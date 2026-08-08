import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Certificate } from './certificate.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { Role } from '../../common/roles';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { renderCertificatePdf } from './pdf';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

function generateCode(): string {
  // e.g. "PC-8F3A-1B2C-9D4E" — human-friendly, unlikely to collide.
  const hex = randomBytes(6).toString('hex').toUpperCase();
  return `PC-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @InjectRepository(Certificate) private readonly repo: Repository<Certificate>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async issueForEnrollment(enrollmentId: string): Promise<Certificate> {
    const existing = await this.repo.findOne({ where: { enrollmentId } });
    if (existing) return existing;
    const enr = await this.enrollments.findOne({ where: { id: enrollmentId } });
    if (!enr) throw new NotFoundException('Enrollment not found');
    if (enr.status !== 'completed') {
      throw new ForbiddenException('Enrollment not completed');
    }
    const course = await this.courses.findOne({ where: { id: enr.courseId } });
    const expiresAt = course?.validityMonths
      ? addMonths(new Date(), course.validityMonths)
      : null;

    const cert = await this.repo.save(this.repo.create({
      enrollmentId: enr.id,
      userId: enr.userId,
      courseId: enr.courseId,
      code: generateCode(),
      expiresAt,
    }));

    // Fire-and-forget email; failure shouldn't roll back cert issuance.
    this.emailCertificate(cert).catch((e) =>
      this.logger.error(`Failed to email certificate ${cert.code}: ${e?.message ?? e}`),
    );

    this.notifications.create({
      userId: cert.userId,
      kind: 'certificate_issued',
      title: 'Certificado emitido',
      body: `Tu certificado (${cert.code}) está listo. Puedes descargarlo desde tu perfil.`,
      link: '/dashboard/employee/certificates',
    }).catch(() => undefined);

    return cert;
  }

  async emailCertificate(cert: Certificate) {
    return this.emailCertificateTo(cert);
  }

  async emailCertificateTo(cert: Certificate, to?: string) {
    const [holder, course] = await Promise.all([
      this.users.findOne({ where: { id: cert.userId } }),
      this.courses.findOne({ where: { id: cert.courseId } }),
    ]);
    if (!holder || !course) {
      return { ok: false, delivered: false, reason: 'certificate_metadata_missing' };
    }
    const recipient = (to && to.trim()) || holder.email;

    // If Resend is not configured we still return ok — mail is fire-and-log in dev.
    const mailConfigured = !!this.config.get<string>('RESEND_API_KEY');

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const pdf = await streamToBuffer(renderCertificatePdf({
      code: cert.code,
      holder: `${holder.firstName} ${holder.lastName}`,
      courseTitle: course.titleEs,
      nomReference: course.nomReference,
      dc3Folio: cert.dc3Folio,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      revokedAt: cert.revokedAt,
      verifyUrl: `${appUrl}/certificate-lookup`,
    }));

    try {
      await this.mail.sendCertificateIssued({
        to: recipient,
        firstName: holder.firstName,
        courseTitle: course.titleEs,
        code: cert.code,
        pdf,
      });
    } catch (err: any) {
      this.logger.warn(`Failed to email certificate ${cert.code}: ${err?.message ?? err}`);
      return { ok: true, delivered: false, reason: 'mail_send_failed' };
    }

    if (!mailConfigured) {
      return { ok: true, delivered: false, reason: 'mail_not_configured', sentTo: recipient };
    }
    return { ok: true, delivered: true, sentTo: recipient };
  }

  async findByFolio(folio: string): Promise<Certificate | null> {
    const cleaned = folio.trim();
    // Try UUID first, then the PC-XXXX verification code, then DC-3 folio.
    if (/^[0-9a-f-]{36}$/i.test(cleaned)) {
      const byId = await this.repo.findOne({ where: { id: cleaned } });
      if (byId) return byId;
    }
    const byCode = await this.repo.findOne({ where: { code: cleaned.toUpperCase() } });
    if (byCode) return byCode;
    const byFolio = await this.repo.findOne({ where: { dc3Folio: cleaned } });
    return byFolio ?? null;
  }

  listMine(actor: RequestUser): Promise<Certificate[]> {
    return this.repo.find({ where: { userId: actor.userId }, order: { issuedAt: 'DESC' } });
  }

  async findByCode(code: string) {
    return this.repo.findOne({ where: { code: code.trim().toUpperCase() } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async listAll(): Promise<Certificate[]> {
    return this.repo.find({ order: { issuedAt: 'DESC' }, take: 500 });
  }

  async adminIssue(input: {
    enrollmentId?: string;
    userId?: string;
    courseId?: string;
    dc3Folio?: string;
    expiresAt?: Date | null;
  }, actor?: RequestUser): Promise<Certificate> {
    let enr: Enrollment | null = null;
    if (input.enrollmentId) {
      enr = await this.enrollments.findOne({ where: { id: input.enrollmentId } });
      if (!enr) throw new NotFoundException('Enrollment not found');
    } else {
      if (!input.userId || !input.courseId) {
        throw new NotFoundException('Provide enrollmentId or userId+courseId');
      }
      enr = await this.enrollments.findOne({
        where: { userId: input.userId, courseId: input.courseId },
      });
      if (!enr) {
        enr = await this.enrollments.save(this.enrollments.create({
          userId: input.userId,
          courseId: input.courseId,
          status: 'completed',
          progressPct: 100,
          completedAt: new Date(),
        }));
      } else if (enr.status !== 'completed') {
        enr.status = 'completed';
        enr.progressPct = 100;
        enr.completedAt = new Date();
        await this.enrollments.save(enr);
      }
    }

    const existing = await this.repo.findOne({ where: { enrollmentId: enr.id } });
    if (existing && !existing.revokedAt) return existing;

    const course = await this.courses.findOne({ where: { id: enr.courseId } });
    const expiresAt = input.expiresAt !== undefined
      ? input.expiresAt
      : (course?.validityMonths ? addMonths(new Date(), course.validityMonths) : null);

    const cert = await this.repo.save(this.repo.create({
      enrollmentId: enr.id,
      userId: enr.userId,
      courseId: enr.courseId,
      code: generateCode(),
      dc3Folio: input.dc3Folio ?? null,
      expiresAt,
    }));

    this.emailCertificate(cert).catch((e) =>
      this.logger.error(`Failed to email admin-issued cert ${cert.code}: ${e?.message ?? e}`),
    );
    this.audit.record({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      action: 'certificate.admin_issue',
      entityType: 'certificate',
      entityId: cert.id,
      metadata: { code: cert.code, userId: cert.userId, courseId: cert.courseId, dc3Folio: cert.dc3Folio },
    });
    this.notifications.create({
      userId: cert.userId,
      kind: 'certificate_issued',
      title: 'Certificado emitido',
      body: `Tu certificado (${cert.code}) está listo.`,
      link: '/dashboard/employee/certificates',
    }).catch(() => undefined);

    return cert;
  }

  async updateAdmin(
    id: string,
    input: { dc3Folio?: string | null; expiresAt?: Date | null },
    actor?: RequestUser,
  ): Promise<Certificate> {
    const cert = await this.repo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');
    if (input.dc3Folio !== undefined) cert.dc3Folio = input.dc3Folio;
    if (input.expiresAt !== undefined) cert.expiresAt = input.expiresAt;
    const saved = await this.repo.save(cert);
    this.audit.record({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      action: 'certificate.update',
      entityType: 'certificate',
      entityId: saved.id,
      metadata: { code: saved.code, dc3Folio: saved.dc3Folio, expiresAt: saved.expiresAt },
    });
    return saved;
  }

  async revoke(id: string, reason: string, actor?: RequestUser): Promise<Certificate> {
    const cert = await this.repo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');
    if (cert.revokedAt) return cert;
    cert.revokedAt = new Date();
    cert.revokedReason = reason || 'Revoked by administrator';
    const saved = await this.repo.save(cert);
    this.audit.record({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      action: 'certificate.revoke',
      entityType: 'certificate',
      entityId: saved.id,
      metadata: { code: saved.code, reason: saved.revokedReason },
    });
    this.notifications.create({
      userId: saved.userId,
      kind: 'certificate_revoked',
      title: 'Certificado revocado',
      body: `Tu certificado ${saved.code} fue revocado. Motivo: ${saved.revokedReason}`,
      link: '/dashboard/employee/certificates',
    }).catch(() => undefined);
    return saved;
  }

  // Public — used by the certificate-lookup page. Returns a redacted view.
  async lookup(code: string): Promise<{
    code: string;
    issuedAt: Date;
    expiresAt: Date | null;
    revokedAt: Date | null;
    holder: string;
    course: string;
    nomReference: string | null;
    dc3Folio: string | null;
  }> {
    const cert = await this.repo.findOne({ where: { code: code.trim().toUpperCase() } });
    if (!cert) throw new NotFoundException('Certificate not found');
    const [user, course] = await Promise.all([
      this.users.findOne({ where: { id: cert.userId } }),
      this.courses.findOne({ where: { id: cert.courseId } }),
    ]);
    return {
      code: cert.code,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      revokedAt: cert.revokedAt,
      holder: user ? `${user.firstName} ${user.lastName}` : '—',
      course: course?.titleEs ?? '—',
      nomReference: course?.nomReference ?? null,
      dc3Folio: cert.dc3Folio,
    };
  }
}

function addMonths(d: Date, months: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + months);
  return out;
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (c: Buffer) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
