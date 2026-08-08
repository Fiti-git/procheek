import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './certificate.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { ExpiryReminderCron } from './expiry-reminder.cron';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Enrollment, Course, User])],
  controllers: [CertificatesController],
  providers: [CertificatesService, ExpiryReminderCron],
  exports: [CertificatesService],
})
export class CertificatesModule {}
