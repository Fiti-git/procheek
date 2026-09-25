import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseModule as CourseModuleEntity } from './course-module.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseModuleEntity, Enrollment]),
    CertificatesModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule implements OnModuleInit {
  private readonly logger = new Logger(CoursesModule.name);
  constructor(private readonly courses: CoursesService) {}

  async onModuleInit() {
    const res = await this.courses.seedIfEmpty();
    if (res.seeded > 0) {
      this.logger.log(`Course catalog seeded (${res.seeded} rows)`);
    }
    const mods = await this.courses.seedModulesIfEmpty();
    if (mods.modulesCreated > 0) {
      this.logger.log(`Course modules seeded (${mods.modulesCreated} modules / ${mods.coursesSeeded} courses)`);
    }
  }
}
