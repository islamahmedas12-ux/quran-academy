import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enrollment_id' })
  enrollmentId: string;

  @ManyToOne(() => Enrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'certificate_url', nullable: true })
  certificateUrl: string;

  @Column({ name: 'issued_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
