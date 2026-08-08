import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'uploads' })
export class Upload {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'storage_path' })
  storagePath!: string;

  @Column({ type: 'text', name: 'original_name' })
  originalName!: string;

  @Column({ type: 'text', name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'int', name: 'size_bytes' })
  sizeBytes!: number;

  @Column({ type: 'uuid', name: 'uploaded_by', nullable: true })
  uploadedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
