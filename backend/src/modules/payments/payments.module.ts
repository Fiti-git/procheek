import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './invoice.entity';
import { PaymentWebhookEvent } from './payment-webhook-event.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, Invoice, Course, User, Enrollment, PaymentWebhookEvent]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
