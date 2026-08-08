import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'payment_id', unique: true })
  paymentId!: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId!: string | null;

  @Index({ unique: true })
  @Column({ type: 'text' })
  number!: string;

  @Column({ type: 'text', name: 'cfdi_uuid', nullable: true })
  cfdiUuid!: string | null;

  @Column({ type: 'text', name: 'cfdi_xml_url', nullable: true })
  cfdiXmlUrl!: string | null;

  @Column({ type: 'text', name: 'pdf_url', nullable: true })
  pdfUrl!: string | null;

  @Column({ type: 'numeric', name: 'subtotal_mxn', precision: 10, scale: 2, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  }})
  subtotalMxn!: number;

  @Column({ type: 'numeric', name: 'tax_mxn', precision: 10, scale: 2, default: 0, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  }})
  taxMxn!: number;

  @Column({ type: 'numeric', name: 'total_mxn', precision: 10, scale: 2, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  }})
  totalMxn!: number;

  @CreateDateColumn({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  @Column({ type: 'timestamptz', name: 'stamped_at', nullable: true })
  stampedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'cfdi_canceled_at', nullable: true })
  cfdiCanceledAt!: Date | null;

  @Column({ type: 'text', name: 'cfdi_reason', nullable: true })
  cfdiReason!: string | null;

  @Column({ type: 'text', name: 'cfdi_status', nullable: true })
  cfdiStatus!: string | null;
}
