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

  // Legacy slug (kept for backwards compat with existing rows / callers).
  @Index({ unique: true })
  @Column({ type: 'text' })
  slug!: string;

  // Public course code (e.g. "NOM-009"). Unique when set.
  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  code!: string | null;

  // Canonical single-language title used by marketing/admin UI.
  @Column({ type: 'text', nullable: true })
  title!: string | null;

  @Column({ type: 'text', name: 'title_es' })
  titleEs!: string;

  @Column({ type: 'text', name: 'title_en', nullable: true })
  titleEn!: string | null;

  // Canonical single-language description.
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', name: 'description_es', nullable: true })
  descriptionEs!: string | null;

  @Column({ type: 'text', name: 'description_en', nullable: true })
  descriptionEn!: string | null;

  @Column({ type: 'text', name: 'nom_reference', nullable: true })
  nomReference!: string | null;

  // Whole-hour duration (course catalog).
  @Column({ type: 'int', default: 0 })
  hours!: number;

  // Canonical price column (MXN).
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  }})
  price!: number;

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

  // Industry vertical: quimica | metalmecanica | mineria | construccion | general
  @Column({ type: 'text', nullable: true })
  industry!: string | null;

  // Course tier: basico | complementario
  @Column({ type: 'text', nullable: true })
  tier!: string | null;

  // Optional cover image URL for the course.
  @Column({ type: 'text', name: 'image_url', nullable: true })
  imageUrl!: string | null;

  // Active flag for soft-hide from the public catalog.
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

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
