import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type EnrollmentStatus = 'active' | 'completed' | 'failed' | 'expired' | 'cancelled';

@Entity({ name: 'enrollments' })
@Index(['userId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId!: string | null;

  @Column({ type: 'text', default: 'active' })
  status!: EnrollmentStatus;

  @Column({ type: 'int', name: 'progress_pct', default: 0 })
  progressPct!: number;

  @CreateDateColumn({ name: 'enrolled_at', type: 'timestamptz' })
  enrolledAt!: Date;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'uuid', name: 'recertification_of', nullable: true })
  recertificationOf!: string | null;
}
