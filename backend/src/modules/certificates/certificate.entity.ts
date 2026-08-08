import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'certificates' })
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'enrollment_id', unique: true })
  enrollmentId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  code!: string;

  @CreateDateColumn({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'text', name: 'pdf_url', nullable: true })
  pdfUrl!: string | null;

  @Column({ type: 'text', name: 'dc3_folio', nullable: true })
  dc3Folio!: string | null;

  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;

  @Column({ type: 'text', name: 'revoked_reason', nullable: true })
  revokedReason!: string | null;
}
