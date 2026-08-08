import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentItem {
  courseId: string;
  qty: number;
  priceMxn: number;
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId!: string | null;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @Column({ type: 'numeric', name: 'amount_mxn', precision: 10, scale: 2, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  }})
  amountMxn!: number;

  @Column({ type: 'text', default: 'MXN' })
  currency!: string;

  @Column({ type: 'text', default: 'pending' })
  status!: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  provider!: string | null;

  @Column({ type: 'text', name: 'provider_ref', nullable: true })
  providerRef!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  items!: PaymentItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'webhook_received_at', nullable: true })
  webhookReceivedAt!: Date | null;
}
