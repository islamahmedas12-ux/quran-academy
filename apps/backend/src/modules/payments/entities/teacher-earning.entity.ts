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

export enum TeacherEarningStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Entity('teacher_earnings')
export class TeacherEarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ name: 'gross_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  grossAmount: number;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  netAmount: number;

  @Column({
    type: 'enum',
    enum: TeacherEarningStatus,
    default: TeacherEarningStatus.PENDING,
  })
  status: TeacherEarningStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
