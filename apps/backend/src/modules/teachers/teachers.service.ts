import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { AvailabilitySlot } from '../classes/entities/availability-slot.entity';
import { ScheduledClass, ClassStatus } from '../classes/entities/scheduled-class.entity';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AvailabilitySlot)
    private readonly availabilityRepository: Repository<AvailabilitySlot>,
    @InjectRepository(ScheduledClass)
    private readonly classRepository: Repository<ScheduledClass>,
  ) {}

  async findAll(filters?: {
    specialty?: string;
    language?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: User[]; total: number }> {
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

    if (filters?.limit) {
      qb.take(filters.limit);
    }
    if (filters?.offset) {
      qb.skip(filters.offset);
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
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

  async getAvailability(teacherId: string): Promise<{ teacherId: string; availability: AvailabilitySlot[] }> {
    const teacher = await this.findById(teacherId);
    const slots = await this.availabilityRepository.find({
      where: { teacherId: teacher.id, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
    return {
      teacherId: teacher.id,
      availability: slots,
    };
  }

  async getStats(teacherId: string): Promise<{
    totalClasses: number;
    completedClasses: number;
    upcomingClasses: number;
    averageRating: number;
  }> {
    await this.findById(teacherId);

    const totalClasses = await this.classRepository.count({
      where: { teacherId },
    });

    const completedClasses = await this.classRepository.count({
      where: { teacherId, status: ClassStatus.COMPLETED },
    });

    const upcomingClasses = await this.classRepository.count({
      where: { teacherId, status: ClassStatus.CONFIRMED },
    });

    const ratingResult = await this.classRepository
      .createQueryBuilder('sc')
      .select('AVG(sc.teacher_rating)', 'avgRating')
      .where('sc.teacher_id = :teacherId', { teacherId })
      .andWhere('sc.teacher_rating > :minRating', { minRating: 0 })
      .getRawOne();

    const averageRating = ratingResult?.avgRating ? parseFloat(ratingResult.avgRating) : 0;

    return {
      totalClasses,
      completedClasses,
      upcomingClasses,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }
}