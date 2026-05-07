import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(filters?: {
    specialty?: string;
    language?: string;
    organizationId?: string;
  }): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('teacher')
      .where('teacher.role = :role', { role: UserRole.TEACHER })
      .andWhere('teacher.isActive = :isActive', { isActive: true });

    if (filters?.organizationId) {
      qb.andWhere('teacher.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters?.language) {
      qb.andWhere('teacher.language = :language', { language: filters.language });
    }

    qb.orderBy('teacher.fullName', 'ASC');

    return qb.getMany();
  }

  async findById(id: string): Promise<User> {
    const teacher = await this.userRepository.findOne({
      where: { id, role: UserRole.TEACHER, isActive: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async getAvailability(teacherId: string): Promise<any> {
    const teacher = await this.findById(teacherId);
    return {
      teacherId: teacher.id,
      availability: [],
    };
  }

  async getStats(teacherId: string): Promise<{
    totalClasses: number;
    completedClasses: number;
    upcomingClasses: number;
    averageRating: number;
  }> {
    await this.findById(teacherId);

    return {
      totalClasses: 0,
      completedClasses: 0,
      upcomingClasses: 0,
      averageRating: 0,
    };
  }
}
