import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommissionRule } from './vendor-profile.entity';

export type DealPackage = 'basico' | 'plus' | 'enterprise' | 'custom';

@Entity({ name: 'sales_deals' })
export class SalesDeal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'vendedor_id' })
  vendedorId!: string;

  @Column({ type: 'uuid', name: 'lead_id', nullable: true })
  leadId!: string | null;

  @Column({ type: 'uuid', name: 'buyer_company_id', nullable: true })
  buyerCompanyId!: string | null;

  @Column({ type: 'text', name: 'buyer_name' })
  buyerName!: string;

  @Column({ type: 'text' })
  package!: DealPackage;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  amount!: number;

  @Column({
    type: 'numeric',
    name: 'commission_pct',
    precision: 5,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  commissionPct!: number;

  @Column({
    type: 'numeric',
    name: 'commission_amount',
    precision: 12,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  commissionAmount!: number;

  @Column({ type: 'jsonb', name: 'commission_rule_snapshot' })
  commissionRuleSnapshot!: CommissionRule;

  @Column({ type: 'timestamptz', name: 'closed_at', default: () => 'NOW()' })
  closedAt!: Date;

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
