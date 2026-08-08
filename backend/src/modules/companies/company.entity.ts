import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CompanyType = 'client' | 'subcontractor';
export type CompanyStatus = 'active' | 'suspended';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'legal_name' })
  legalName!: string;

  @Index({ unique: true, where: '"rfc" IS NOT NULL' })
  @Column({ type: 'text', nullable: true })
  rfc!: string | null;

  @Column({ type: 'text', enum: ['client', 'subcontractor'] })
  type!: CompanyType;

  @Column({ type: 'uuid', name: 'parent_company_id', nullable: true })
  parentCompanyId!: string | null;

  @Column({ type: 'text', name: 'contact_email', nullable: true })
  contactEmail!: string | null;

  @Column({ type: 'text', name: 'contact_phone', nullable: true })
  contactPhone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({ type: 'text', nullable: true })
  state!: string | null;

  @Column({ type: 'text', nullable: true })
  zip!: string | null;

  @Column({ type: 'text', nullable: true })
  industry!: string | null;

  @Column({ type: 'text', default: 'active' })
  status!: CompanyStatus;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
