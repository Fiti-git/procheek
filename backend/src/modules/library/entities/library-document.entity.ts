import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LibraryCategory =
  | 'general'
  | 'nom_009'
  | 'nom_017'
  | 'nom_002'
  | 'nom_019'
  | 'nom_036'
  | 'other';

@Entity({ name: 'library_documents' })
export class LibraryDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({ type: 'text', default: 'general' })
  category!: LibraryCategory;

  @Column({ type: 'text', name: 'file_type' })
  fileType!: string;

  @Column({ type: 'text', name: 'file_url' })
  fileUrl!: string;

  @Column({ type: 'bigint', name: 'file_size_bytes', nullable: true })
  fileSizeBytes!: string | null;

  @Column({ type: 'text', name: 'thumbnail_url', nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'text', name: 'nom_reference', nullable: true })
  nomReference!: string | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  industry!: string | null;

  @Column({ type: 'boolean', name: 'is_free', default: true })
  isFree!: boolean;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price!: string | null;

  @Index()
  @Column({ type: 'boolean', name: 'is_published', default: true })
  isPublished!: boolean;

  @Column({ type: 'integer', name: 'download_count', default: 0 })
  downloadCount!: number;

  @Index()
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
