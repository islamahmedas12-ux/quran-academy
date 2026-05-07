import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';
import { ScheduledClass, ClassStatus } from '../classes/entities/scheduled-class.entity';
import { LessonProgress } from '../courses/entities/lesson-progress.entity';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(ScheduledClass)
    private readonly classRepository: Repository<ScheduledClass>,
    @InjectRepository(LessonProgress)
    private readonly progressRepository: Repository<LessonProgress>,
  ) {}

  async findAll(organizationId?: string): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('student')
      .where('student.role = :role', { role: UserRole.STUDENT })
      .andWhere('student.isActive = :isActive', { isActive: true });

    if (organizationId) {
      qb.andWhere('student.organizationId = :organizationId', { organizationId });
    }

    qb.orderBy('student.fullName', 'ASC');

    return qb.getMany();
  }

  async findById(id: string): Promise<User> {
    const student = await this.userRepository.findOne({
      where: { id, role: UserRole.STUDENT, isActive: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findByParent(parentId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.STUDENT, isActive: true, parentId },
    });
  }

  async linkToParent(studentId: string, parentId: string): Promise<User> {
    const student = await this.findById(studentId);
    student.parentId = parentId;
    return this.userRepository.save(student);
  }

  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    await this.findById(studentId);
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async getClasses(studentId: string): Promise<ScheduledClass[]> {
    await this.findById(studentId);
    return this.classRepository.find({
      where: { studentId },
      order: { startTime: 'DESC' },
    });
  }

  async getProgress(studentId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    totalClasses: number;
    completedClasses: number;
  }> {
    await this.findById(studentId);

    const enrollments = await this.enrollmentRepository.find({
      where: { studentId },
    });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completedAt).length;

    const totalClasses = await this.classRepository.count({
      where: { studentId },
    });

    const completedClasses = await this.classRepository.count({
      where: { studentId, status: ClassStatus.COMPLETED },
    });

    return {
      totalCourses,
      completedCourses,
      totalClasses,
      completedClasses,
    };
  }
}