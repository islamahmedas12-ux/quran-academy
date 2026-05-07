import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum TransactionType {
  CLASS_PAYMENT = 'class_payment',
  COURSE_REVENUE = 'course_revenue',
  PLATFORM_FEE = 'platform_fee',
  PAYOUT = 'payout',
}

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'teacher_id', nullable: true })
  teacherId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId: string;

  @Column({ name: 'stripe_invoice_id', nullable: true })
  stripeInvoiceId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'currency', default: 'SAR' })
  currency: string;

  @Column({ name: 'status', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
