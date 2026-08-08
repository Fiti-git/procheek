import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './certificate.entity';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

const REMINDER_WINDOWS = [30, 15, 1];

@Injectable()
export class ExpiryReminderCron {
  private readonly logger = new Logger(ExpiryReminderCron.name);

  constructor(
    @InjectRepository(Certificate) private readonly certs: Repository<Certificate>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async run() {
    const now = new Date();
    let sent = 0;

    for (const days of REMINDER_WINDOWS) {
      const target = new Date(now);
      target.setDate(target.getDate() + days);
      const startOfDay = new Date(target); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(target); endOfDay.setHours(23, 59, 59, 999);

      const due = await this.certs.createQueryBuilder('c')
        .where('c.revoked_at IS NULL')
        .andWhere('c.expires_at BETWEEN :s AND :e', { s: startOfDay, e: endOfDay })
        .getMany();

      for (const cert of due) {
        try {
          const [holder, course] = await Promise.all([
            this.users.findOne({ where: { id: cert.userId } }),
            this.courses.findOne({ where: { id: cert.courseId } }),
          ]);
          if (!holder || !course || !cert.expiresAt) continue;

          await this.mail.sendCertificateExpiring({
            to: holder.email,
            firstName: holder.firstName,
            courseTitle: course.titleEs,
            code: cert.code,
            expiresAt: cert.expiresAt,
            daysLeft: days,
          });
          await this.notifications.create({
            userId: cert.userId,
            kind: 'certificate_expiring',
            title: `Certificado por vencer (${days}d)`,
            body: `Tu certificado ${cert.code} vence en ${days} día${days === 1 ? '' : 's'}.`,
            link: '/dashboard/employee/certificates',
          });
          sent++;
        } catch (e: any) {
          this.logger.error(`Reminder failed for cert ${cert.code}: ${e?.message ?? e}`);
        }
      }
    }

    if (sent) this.logger.log(`Sent ${sent} certificate expiry reminder(s).`);
  }
}
