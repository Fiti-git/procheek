import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SessionStatus = 'scheduled' | 'delivered' | 'canceled';

@Entity({ name: 'training_sessions' })
export class TrainingSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'capacitador_id' })
  capacitadorId!: string;

  @Column({ type: 'uuid', name: 'client_company_id', nullable: true })
  clientCompanyId!: string | null;

  @Column({ type: 'uuid', name: 'course_id', nullable: true })
  courseId!: string | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'timestamptz', name: 'scheduled_at' })
  scheduledAt!: Date;

  @Column({ type: 'timestamptz', name: 'delivered_at', nullable: true })
  deliveredAt!: Date | null;

  @Column({
    type: 'numeric',
    name: 'duration_hours',
    precision: 4,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null | undefined) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  durationHours!: number | null;

  @Column({ type: 'int', name: 'attendee_count', default: 0 })
  attendeeCount!: number;

  @Column({ type: 'text', nullable: true })
  location!: string | null;

  @Column({ type: 'text', default: 'scheduled' })
  status!: SessionStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
