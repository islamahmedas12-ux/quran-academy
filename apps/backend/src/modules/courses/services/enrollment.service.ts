import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { LessonProgress } from '../entities/lesson-progress.entity';
import { Course } from '../entities/course.entity';
import { UpdateProgressDto } from '../dto/enrollment.dto';
import { UsersService } from '../../users/users.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { SubscriptionTier } from '../../payments/entities/subscription-tier.entity';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(SubscriptionTier)
    private readonly subscriptionTierRepository: Repository<SubscriptionTier>,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async enroll(studentId: string, courseId: string): Promise<Enrollment> {
    const student = await this.usersService.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['lessons'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existing = await this.enrollmentRepository.findOne({
      where: { studentId, courseId },
    });
    if (existing) {
      throw new BadRequestException('Already enrolled in this course');
    }

    const canEnroll = await this.checkEnrollmentPermission(student.organizationId);
    if (!canEnroll) {
      throw new ForbiddenException('Subscription plan does not allow enrollment in more courses');
    }

    const enrollment = this.enrollmentRepository.create({
      studentId,
      courseId,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async findMyEnrollments(studentId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: ['course', 'course.instructor'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['course', 'course.lessons', 'lessonProgress', 'student'],
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.studentId !== userId) {
      const user = await this.usersService.findById(userId);
      if (!user || (user.role !== 'org_admin' && user.id !== enrollment.course.instructorId)) {
        throw new ForbiddenException('You do not have access to this enrollment');
      }
    }

    return enrollment;
  }

  async unenroll(id: string, userId: string): Promise<void> {
    const enrollment = await this.findOne(id, userId);

    if (enrollment.studentId !== userId) {
      const user = await this.usersService.findById(userId);
      if (!user || user.role !== 'org_admin') {
        throw new ForbiddenException('You can only unenroll yourself');
      }
    }

    await this.enrollmentRepository.remove(enrollment);
  }

  async updateProgress(enrollmentId: string, userId: string, dto: UpdateProgressDto): Promise<LessonProgress> {
    const enrollment = await this.findOne(enrollmentId, userId);

    let progress = await this.lessonProgressRepository.findOne({
      where: { enrollmentId, lessonId: dto.lessonId },
    });

    if (!progress) {
      progress = this.lessonProgressRepository.create({
        enrollmentId,
        lessonId: dto.lessonId,
      });
    }

    if (dto.watchedDuration !== undefined) {
      progress.watchedDuration = dto.watchedDuration;
    }

    if (dto.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await this.lessonProgressRepository.save(progress);

    await this.updateEnrollmentProgress(enrollment);

    return progress;
  }

  async getProgress(enrollmentId: string, userId: string): Promise<LessonProgress[]> {
    await this.findOne(enrollmentId, userId);

    return this.lessonProgressRepository.find({
      where: { enrollmentId },
      relations: ['lesson'],
    });
  }

  private async updateEnrollmentProgress(enrollment: Enrollment): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: enrollment.courseId },
      relations: ['lessons'],
    });

    if (!course || !course.lessons.length) return;

    const completedCount = await this.lessonProgressRepository.count({
      where: { enrollmentId: enrollment.id, isCompleted: true },
    });

    const totalLessons = course.lessons.length;
    enrollment.progress = Math.round((completedCount / totalLessons) * 100);

    if (enrollment.progress >= 100) {
      enrollment.completedAt = new Date();
    }

    await this.enrollmentRepository.save(enrollment);
  }

  private async checkEnrollmentPermission(organizationId: string): Promise<boolean> {
    const org = await this.organizationsService.findOne(organizationId);
    if (!org) return true;

    if (!org.subscriptionTier) {
      const defaultTier = await this.subscriptionTierRepository.findOne({
        where: { tier: 'free' },
      });
      if (!defaultTier) return true;

      const enrollmentCount = await this.enrollmentRepository.count({
        where: { studentId: org.id },
      });

      return enrollmentCount < (defaultTier.maxCourses || 3);
    }

    return true;
  }
}
