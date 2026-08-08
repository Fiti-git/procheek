import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type NotificationKind =
  | 'invite'
  | 'enrolled'
  | 'quiz_passed'
  | 'quiz_failed'
  | 'certificate_issued'
  | 'certificate_expiring'
  | 'certificate_revoked'
  | 'payment_paid';

@Entity({ name: 'notifications' })
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text' })
  kind!: NotificationKind;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ type: 'text', nullable: true })
  link!: string | null;

  @Column({ type: 'timestamptz', name: 'read_at', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
