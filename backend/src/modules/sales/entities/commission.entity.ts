import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'void';

@Entity({ name: 'commissions' })
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'vendedor_id' })
  vendedorId!: string;

  @Column({ type: 'uuid', name: 'deal_id' })
  dealId!: string;

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

  @Column({ type: 'text', default: 'pending' })
  status!: CommissionStatus;

  @Column({ type: 'date', name: 'period_month' })
  periodMonth!: string;

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
