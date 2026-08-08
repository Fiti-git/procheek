import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CfdiModule } from './modules/cfdi/cfdi.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LibraryModule } from './modules/library/library.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SupportModule } from './modules/support/support.module';
import { AuditModule } from './modules/audit/audit.module';
import { SalesModule } from './modules/sales/sales.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'procheeck'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    HealthModule,
    MailModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CoursesModule,
    EnrollmentsModule,
    QuizzesModule,
    CertificatesModule,
    PaymentsModule,
    CfdiModule,
    UploadsModule,
    AnalyticsModule,
    LibraryModule,
    NotificationsModule,
    SupportModule,
    AuditModule,
    SalesModule,
    TrainingModule,
  ],
})
export class AppModule {}
