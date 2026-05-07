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

export enum ClassStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ClassRating {
  NONE = 0,
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  VERY_GOOD = 4,
  EXCELLENT = 5,
}

@Entity('scheduled_classes')
export class ScheduledClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Index()
  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Index()
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: ClassStatus, default: ClassStatus.PENDING })
  status: ClassStatus;

  @Column({ nullable: true })
  topic: string;

  @Column({ name: 'jitsi_room', nullable: true })
  jitsiRoom: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'homework_description', nullable: true })
  homeworkDescription: string;

  @Column({ name: 'homework_url', nullable: true })
  homeworkUrl: string;

  @Column({ name: 'recording_enabled', default: false })
  recordingEnabled: boolean;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ name: 'teacher_rating', type: 'int', default: ClassRating.NONE })
  teacherRating: ClassRating;

  @Column({ name: 'teacher_feedback', nullable: true })
  teacherFeedback: string;

  @Column({ name: 'student_rating', type: 'int', default: ClassRating.NONE })
  studentRating: ClassRating;

  @Column({ name: 'student_feedback', nullable: true })
  studentFeedback: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
