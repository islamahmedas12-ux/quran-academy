import { Repository } from 'typeorm';
import { AvailabilitySlot } from '../entities/availability-slot.entity';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from '../dtos/class.dtos';
export declare class AvailabilityService {
    private readonly availabilityRepo;
    private readonly logger;
    constructor(availabilityRepo: Repository<AvailabilitySlot>);
    getTeacherAvailability(teacherId: string, fromDate?: string, toDate?: string): Promise<AvailabilitySlot[]>;
    upsertAvailability(teacherId: string, dto: CreateAvailabilityDto): Promise<AvailabilitySlot>;
    updateAvailability(teacherId: string, slotId: string, dto: UpdateAvailabilityDto): Promise<AvailabilitySlot>;
    deleteAvailability(teacherId: string, slotId: string): Promise<void>;
    checkSlotAvailable(teacherId: string, startTime: Date, endTime: Date): Promise<boolean>;
}
