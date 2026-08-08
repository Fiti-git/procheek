import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'library_purchases' })
@Unique(['userId', 'documentId'])
export class LibraryPurchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'document_id' })
  documentId!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'uuid', name: 'payment_id', nullable: true })
  paymentId!: string | null;

  @CreateDateColumn({ name: 'purchased_at', type: 'timestamptz' })
  purchasedAt!: Date;
}
