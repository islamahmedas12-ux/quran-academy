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

@Entity('availability_slots')
export class AvailabilitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @Column({ name: 'start_time' })
  startTime: string;

  @Column({ name: 'end_time' })
  endTime: string;

  @Column({ name: 'is_recurring', default: true })
  isRecurring: boolean;

  @Column({ name: 'specific_date', type: 'timestamp', nullable: true })
  specificDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
