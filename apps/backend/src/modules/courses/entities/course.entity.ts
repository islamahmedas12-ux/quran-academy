import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Lesson } from './lesson.entity';
import { Enrollment } from './enrollment.entity';

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseCategory {
  TAJWEED = 'tajweed',
  QIRAAT = 'qiraat',
  TAFSIR = 'tafsir',
  HIFZ = 'hifz',
  ARABIC = 'arabic',
  ISLAMIC_STUDIES = 'islamic_studies',
  OTHER = 'other',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: CourseCategory, default: CourseCategory.OTHER })
  category: CourseCategory;

  @Column({ default: 'ar' })
  language: string;

  @Column({ type: 'enum', enum: CourseDifficulty, default: CourseDifficulty.BEGINNER })
  difficulty: CourseDifficulty;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ name: 'instructor_id' })
  instructorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @Column({ type: 'simple-array', nullable: true })
  prerequisites: string[];

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
