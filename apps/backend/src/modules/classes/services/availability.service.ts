import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  IsNull,
  Or,
} from 'typeorm';
import { AvailabilitySlot } from '../entities/availability-slot.entity';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from '../dtos/class.dtos';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(AvailabilitySlot)
    private readonly availabilityRepo: Repository<AvailabilitySlot>,
  ) {}

  async getTeacherAvailability(
    teacherId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<AvailabilitySlot[]> {
    const query = this.availabilityRepo
      .createQueryBuilder('slot')
      .where('slot.teacherId = :teacherId', { teacherId })
      .andWhere('slot.isActive = :isActive', { isActive: true });

    if (fromDate) {
      query.andWhere('slot.specificDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('slot.specificDate <= :toDate', { toDate });
    }

    if (!fromDate && !toDate) {
      query.andWhere(
        '(slot.isRecurring = true OR slot.specificDate >= CURRENT_DATE)',
      );
    }

    query.orderBy('slot.dayOfWeek', 'ASC').addOrderBy('slot.startTime', 'ASC');

    return query.getMany();
  }

  async upsertAvailability(
    teacherId: string,
    dto: CreateAvailabilityDto,
  ): Promise<AvailabilitySlot> {
    const existing = await this.availabilityRepo.findOne({
      where: {
        teacherId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        isRecurring: dto.isRecurring !== false,
        specificDate: dto.specificDate ? new Date(dto.specificDate) : IsNull(),
      },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.availabilityRepo.save(existing);
    }

    const slot = this.availabilityRepo.create({
      teacherId,
      ...dto,
    });
    return this.availabilityRepo.save(slot);
  }

  async updateAvailability(
    teacherId: string,
    slotId: string,
    dto: UpdateAvailabilityDto,
  ): Promise<AvailabilitySlot> {
    const slot = await this.availabilityRepo.findOne({
      where: { id: slotId, teacherId },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    Object.assign(slot, dto);
    return this.availabilityRepo.save(slot);
  }

  async deleteAvailability(teacherId: string, slotId: string): Promise<void> {
    const result = await this.availabilityRepo.delete({
      id: slotId,
      teacherId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Availability slot not found');
    }
  }

  async checkSlotAvailable(
    teacherId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const dayOfWeek = startTime.getDay();
    const timeStr = startTime.toISOString().split('T')[1].slice(0, 8);

    const slot = await this.availabilityRepo
      .createQueryBuilder('slot')
      .where('slot.teacherId = :teacherId', { teacherId })
      .andWhere('slot.isActive = :isActive', { isActive: true })
      .andWhere(
        '(slot.isRecurring = true AND slot.dayOfWeek = :dayOfWeek) OR (slot.specificDate = :specificDate)',
      )
      .setParameters({
        teacherId,
        dayOfWeek,
        specificDate: startTime.toISOString().split('T')[0],
      })
      .getOne();

    if (!slot) return false;

    return timeStr >= slot.startTime && timeStr <= slot.endTime;
  }
}
