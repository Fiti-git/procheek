import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'module_completions' })
@Index(['enrollmentId', 'moduleId'], { unique: true })
export class ModuleCompletion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'enrollment_id' })
  enrollmentId!: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId!: string;

  @CreateDateColumn({ name: 'completed_at', type: 'timestamptz' })
  completedAt!: Date;
}
