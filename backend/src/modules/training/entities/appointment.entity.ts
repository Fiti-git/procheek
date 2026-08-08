import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'no_show';

export type AppointmentPurpose = 'demo' | 'consulting' | 'training' | 'follow_up';

export type RequesterKind = 'public' | 'client_admin' | 'client' | 'subcontractor';

export type AssignedRole = 'vendedor' | 'capacitador';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'requester_kind' })
  requesterKind!: RequesterKind;

  @Column({ type: 'uuid', name: 'requester_user_id', nullable: true })
  requesterUserId!: string | null;

  @Column({ type: 'text', name: 'requester_company_name', nullable: true })
  requesterCompanyName!: string | null;

  @Column({ type: 'text', name: 'requester_contact_name' })
  requesterContactName!: string;

  @Column({ type: 'text', name: 'requester_email' })
  requesterEmail!: string;

  @Column({ type: 'text', name: 'requester_phone', nullable: true })
  requesterPhone!: string | null;

  @Column({ type: 'uuid', name: 'assigned_user_id', nullable: true })
  assignedUserId!: string | null;

  @Column({ type: 'text', name: 'assigned_role' })
  assignedRole!: AssignedRole;

  @Column({ type: 'text' })
  purpose!: AppointmentPurpose;

  @Column({ type: 'timestamptz', name: 'scheduled_at' })
  scheduledAt!: Date;

  @Column({ type: 'int', name: 'duration_min', default: 30 })
  durationMin!: number;

  @Column({ type: 'text', default: 'requested' })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
