import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'library_downloads' })
export class LibraryDownload {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @Index()
  @Column({ type: 'uuid', name: 'document_id' })
  documentId!: string;

  @CreateDateColumn({ name: 'downloaded_at', type: 'timestamptz' })
  downloadedAt!: Date;

  @Column({ type: 'text', nullable: true })
  ip!: string | null;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent!: string | null;
}
