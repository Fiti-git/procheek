import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  slug!: string;

  @Column({ type: 'text', name: 'title_es' })
  titleEs!: string;

  @Column({ type: 'text', name: 'title_en', nullable: true })
  titleEn!: string | null;

  @Column({ type: 'text', name: 'description_es', nullable: true })
  descriptionEs!: string | null;

  @Column({ type: 'text', name: 'description_en', nullable: true })
  descriptionEn!: string | null;

  @Column({ type: 'text', name: 'nom_reference', nullable: true })
  nomReference!: string | null;

  @Column({ type: 'numeric', name: 'price_mxn', precision: 10, scale: 2, default: 0, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  }})
  priceMxn!: number;

  @Column({ type: 'numeric', name: 'duration_hours', precision: 5, scale: 2, nullable: true, transformer: {
    to: (v: number | null) => v,
    from: (v: string | null) => v === null ? null : Number(v),
  }})
  durationHours!: number | null;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished!: boolean;

  @Column({ type: 'int', name: 'validity_months', nullable: true })
  validityMonths!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
