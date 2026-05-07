import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionTierType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  INSTITUTION = 'institution',
}

@Entity('subscription_tiers')
export class SubscriptionTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: SubscriptionTierType, unique: true })
  tier: SubscriptionTierType;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceMonthly: number;

  @Column({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceYearly: number;

  @Column({ type: 'jsonb', default: {} })
  features: Record<string, any>;

  @Column({ name: 'max_students', type: 'int', default: 5 })
  maxStudents: number;

  @Column({ name: 'max_teachers', type: 'int', default: 2 })
  maxTeachers: number;

  @Column({ name: 'max_courses', type: 'int', default: 3 })
  maxCourses: number;

  @Column({ name: 'max_live_classes_per_month', type: 'int', default: 0 })
  maxLiveClassesPerMonth: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
