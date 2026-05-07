import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      where: { role: UserRole.STUDENT, isActive: true },
    });
  }

  async linkToParent(studentId: string, parentId: string): Promise<User> {
    const student = await this.findById(studentId);
    return this.userRepository.save(student);
  }

  async getEnrollments(studentId: string): Promise<any[]> {
    await this.findById(studentId);
    return [];
  }

  async getClasses(studentId: string): Promise<any[]> {
    await this.findById(studentId);
    return [];
  }

  async getProgress(studentId: string): Promise<any> {
    await this.findById(studentId);
    return {
      totalCourses: 0,
      completedCourses: 0,
      totalClasses: 0,
      completedClasses: 0,
    };
  }
}
