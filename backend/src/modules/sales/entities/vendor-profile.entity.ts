import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CommissionRule =
  | { type: 'flat'; flat_pct: number }
  | { type: 'package_tier'; package_tiers: Array<{ package: string; pct: number }> }
  | { type: 'volume_tier'; brackets: Array<{ min: number; max?: number | null; pct: number }> }
  | { type: 'custom'; expression: string };

@Entity({ name: 'vendor_profiles' })
export class VendorProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', name: 'employee_id', nullable: true })
  employeeId!: string | null;

  @Column({ type: 'date', name: 'hire_date', nullable: true })
  hireDate!: string | null;

  @Column({
    type: 'numeric',
    name: 'quota_monthly',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number | null | undefined) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  quotaMonthly!: number;

  @Column({ type: 'jsonb', name: 'commission_rule' })
  commissionRule!: CommissionRule;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  specialties!: string[];

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
