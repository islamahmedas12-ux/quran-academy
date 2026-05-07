import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.lessons)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
