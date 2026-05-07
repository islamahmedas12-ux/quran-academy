import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ClassStatus } from '../../../shared/constants/enums';

@Entity('scheduled_classes')
export class ScheduledClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  teacherId: string;

  @Index()
  @Column({ type: 'uuid' })
  studentId: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ type: 'timestamp with time zone' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.PENDING,
  })
  status: ClassStatus;

  @Column({ length: 500, nullable: true })
  topic: string;

  @Column({ length: 255, nullable: true })
  jitsiRoom: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 500, nullable: true })
  homeworkUrl: string;

  @Column({ length: 500, nullable: true })
  homeworkDescription: string;

  @Column({ default: false })
  recordingEnabled: boolean;

  @Column({ length: 255, nullable: true })
  recordingKey: string;

  @Column({ type: 'int', nullable: true })
  teacherRating: number;

  @Column({ type: 'text', nullable: true })
  teacherComment: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  teacherFeedbackAt: Date;

  @Column({ type: 'int', nullable: true })
  studentRating: number;

  @Column({ type: 'text', nullable: true })
  studentComment: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  studentFeedbackAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
