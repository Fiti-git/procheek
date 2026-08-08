import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'payment_webhook_events' })
export class PaymentWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'provider_ref', nullable: true })
  providerRef!: string | null;

  @Column({ type: 'text', name: 'event_id', nullable: true })
  eventId!: string | null;

  @Column({ type: 'jsonb', name: 'payload_json' })
  payloadJson!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  signature!: string | null;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'timestamptz', name: 'processed_at', nullable: true })
  processedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
