import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'propuesta'
  | 'cerrado_ganado'
  | 'cerrado_perdido';

@Entity({ name: 'sales_leads' })
export class SalesLead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'vendedor_id' })
  vendedorId!: string;

  @Column({ type: 'text', name: 'company_name' })
  companyName!: string;

  @Column({ type: 'text', name: 'contact_name' })
  contactName!: string;

  @Column({ type: 'text', name: 'contact_email', nullable: true })
  contactEmail!: string | null;

  @Column({ type: 'text', name: 'contact_phone', nullable: true })
  contactPhone!: string | null;

  @Column({ type: 'text', nullable: true })
  industry!: string | null;

  @Column({
    type: 'numeric',
    name: 'expected_amount',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null | undefined) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  expectedAmount!: number | null;

  @Column({ type: 'text', default: 'nuevo' })
  status!: LeadStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamptz', name: 'closed_at', nullable: true })
  closedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
