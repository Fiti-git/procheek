import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerProfile } from './entities/trainer-profile.entity';
import { Appointment } from './entities/appointment.entity';
import { TrainingSession } from './entities/training-session.entity';
import { VendorProfile } from '../sales/entities/vendor-profile.entity';
import { User } from '../users/user.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { AgendaController } from './agenda.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerProfile, Appointment, TrainingSession, VendorProfile, User]),
  ],
  controllers: [TrainingController, AgendaController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
