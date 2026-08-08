import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'trainer_profiles' })
export class TrainerProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', name: 'stps_registration', nullable: true })
  stpsRegistration!: string | null;

  @Column({ type: 'text', nullable: true })
  rfc!: string | null;

  @Column({
    type: 'numeric',
    name: 'hourly_rate',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null | undefined) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  hourlyRate!: number | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  specialties!: string[];

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
