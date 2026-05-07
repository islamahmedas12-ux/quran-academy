import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../../shared/constants/enums';

@Entity('availability_slots')
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  teacherId: string;

  @Column({ type: 'int', default: 0 })
  dayOfWeek: number;

  @Column({ type: 'time with time zone' })
  startTime: string;

  @Column({ type: 'time with time zone' })
  endTime: string;

  @Column({ default: true })
  isRecurring: boolean;

  @Column({ type: 'date', nullable: true })
  specificDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
