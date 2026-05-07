import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ScheduledClass, ClassStatus } from './entities/scheduled-class.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { BookClassDto, UpdateClassDto, AddNotesDto, AddFeedbackDto, ClassQueryDto } from './dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectRepository(ScheduledClass)
    private readonly classRepository: Repository<ScheduledClass>,
    @InjectRepository(AvailabilitySlot)
    private readonly availabilityRepository: Repository<AvailabilitySlot>,
    private readonly usersService: UsersService,
  ) {}

  async bookClass(studentId: string, dto: BookClassDto): Promise<ScheduledClass> {
    const student = await this.usersService.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const teacher = await this.usersService.findById(dto.teacherId);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot book a class in the past');
    }

    const existingClass = await this.classRepository.findOne({
      where: {
        teacherId: dto.teacherId,
        status: ClassStatus.CONFIRMED,
        startTime: LessThanOrEqual(startTime),
        endTime: MoreThanOrEqual(startTime),
      },
    });

    if (existingClass) {
      throw new BadRequestException('This time slot is already booked');
    }

    const jitsiRoom = this.generateJitsiRoom();

    const scheduledClass = this.classRepository.create({
      teacherId: dto.teacherId,
      studentId,
      organizationId: student.organizationId,
      startTime,
      endTime,
      topic: dto.topic,
      jitsiRoom,
      status: ClassStatus.PENDING,
    });

    return this.classRepository.save(scheduledClass);
  }

  async findUpcoming(userId: string): Promise<ScheduledClass[]> {
    const now = new Date();
    return this.classRepository.find({
      where: [
        { teacherId: userId, startTime: MoreThanOrEqual(now) },
        { studentId: userId, startTime: MoreThanOrEqual(now) },
      ],
      relations: ['teacherId', 'studentId'],
      order: { startTime: 'ASC' },
    });
  }

  async findPast(userId: string): Promise<ScheduledClass[]> {
    const now = new Date();
    return this.classRepository.find({
      where: [
        { teacherId: userId, endTime: LessThanOrEqual(now) },
        { studentId: userId, endTime: LessThanOrEqual(now) },
      ],
      relations: ['teacherId', 'studentId'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ScheduledClass> {
    const scheduledClass = await this.classRepository.findOne({
      where: { id },
      relations: ['teacherId', 'studentId'],
    });

    if (!scheduledClass) {
      throw new NotFoundException('Class not found');
    }

    if (scheduledClass.teacherId !== userId && scheduledClass.studentId !== userId) {
      throw new ForbiddenException('You do not have access to this class');
    }

    return scheduledClass;
  }

  async updateClass(id: string, userId: string, dto: UpdateClassDto): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can update class details');
    }

    Object.assign(scheduledClass, dto);
    return this.classRepository.save(scheduledClass);
  }

  async confirmClass(id: string, userId: string): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can confirm the class');
    }

    scheduledClass.status = ClassStatus.CONFIRMED;
    return this.classRepository.save(scheduledClass);
  }

  async cancelClass(id: string, userId: string): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.teacherId !== userId && scheduledClass.studentId !== userId) {
      throw new ForbiddenException('You cannot cancel this class');
    }

    if (scheduledClass.status === ClassStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed class');
    }

    scheduledClass.status = ClassStatus.CANCELLED;
    return this.classRepository.save(scheduledClass);
  }

  async addNotes(id: string, userId: string, dto: AddNotesDto): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can add notes');
    }

    Object.assign(scheduledClass, dto);
    return this.classRepository.save(scheduledClass);
  }

  async addTeacherFeedback(
    id: string,
    userId: string,
    rating: number,
    dto: AddFeedbackDto,
  ): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can add feedback');
    }

    scheduledClass.teacherRating = rating;
    if (dto.feedback) {
      scheduledClass.teacherFeedback = dto.feedback;
    }

    return this.classRepository.save(scheduledClass);
  }

  async addStudentFeedback(
    id: string,
    userId: string,
    rating: number,
    dto: AddFeedbackDto,
  ): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.studentId !== userId) {
      throw new ForbiddenException('Only the student can add feedback');
    }

    scheduledClass.studentRating = rating;
    if (dto.feedback) {
      scheduledClass.studentFeedback = dto.feedback;
    }

    return this.classRepository.save(scheduledClass);
  }

  async completeClass(id: string, userId: string): Promise<ScheduledClass> {
    const scheduledClass = await this.findOne(id, userId);

    if (scheduledClass.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can mark class as completed');
    }

    scheduledClass.status = ClassStatus.COMPLETED;
    return this.classRepository.save(scheduledClass);
  }

  async setRecordingUrl(id: string, recordingUrl: string): Promise<ScheduledClass> {
    const scheduledClass = await this.classRepository.findOne({ where: { id } });
    if (!scheduledClass) {
      throw new NotFoundException('Class not found');
    }

    scheduledClass.recordingUrl = recordingUrl;
    return this.classRepository.save(scheduledClass);
  }

  async getAvailability(teacherId: string): Promise<AvailabilitySlot[]> {
    return this.availabilityRepository.find({
      where: { teacherId, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async setAvailability(teacherId: string, slots: Partial<AvailabilitySlot>[]): Promise<AvailabilitySlot[]> {
    await this.availabilityRepository.delete({ teacherId });

    const newSlots = slots.map((slot) =>
      this.availabilityRepository.create({
        ...slot,
        teacherId,
      }),
    );

    return this.availabilityRepository.save(newSlots);
  }

  async addAvailabilitySlot(teacherId: string, dto: Partial<AvailabilitySlot>): Promise<AvailabilitySlot> {
    const slot = this.availabilityRepository.create({
      ...dto,
      teacherId,
    });
    return this.availabilityRepository.save(slot);
  }

  async updateAvailabilitySlot(
    id: string,
    teacherId: string,
    dto: Partial<AvailabilitySlot>,
  ): Promise<AvailabilitySlot> {
    const slot = await this.availabilityRepository.findOne({ where: { id, teacherId } });
    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    Object.assign(slot, dto);
    return this.availabilityRepository.save(slot);
  }

  async deleteAvailabilitySlot(id: string, teacherId: string): Promise<void> {
    const slot = await this.availabilityRepository.findOne({ where: { id, teacherId } });
    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    await this.availabilityRepository.remove(slot);
  }

  private generateJitsiRoom(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'quran-academy-';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
