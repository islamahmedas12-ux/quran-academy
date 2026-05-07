import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
} from 'typeorm';
import { ScheduledClass } from '../entities/scheduled-class.entity';
import {
  BookClassDto,
  ClassNotesDto,
  ClassFeedbackDto,
  JoinClassResponseDto,
  RecordingResponseDto,
} from '../dtos/class.dtos';
import { JitsiService } from './jitsi.service';
import { MinioService } from './minio.service';
import { EmailService } from './email.service';
import { AvailabilityService } from './availability.service';
import { ClassStatus } from '../../../shared/constants/enums';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectRepository(ScheduledClass)
    private readonly classRepo: Repository<ScheduledClass>,
    private readonly jitsiService: JitsiService,
    private readonly minioService: MinioService,
    private readonly emailService: EmailService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async bookClass(
    studentId: string,
    organizationId: string,
    dto: BookClassDto,
  ): Promise<ScheduledClass> {
    const startTime = new Date(dto.selectedSlot);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const isAvailable = await this.availabilityService.checkSlotAvailable(
      dto.teacherId,
      startTime,
      endTime,
    );

    if (!isAvailable) {
      throw new BadRequestException(
        'Teacher is not available at this time slot',
      );
    }

    const existing = await this.classRepo.findOne({
      where: {
        teacherId: dto.teacherId,
        startTime,
        status: In([ClassStatus.PENDING, ClassStatus.CONFIRMED]),
      },
    });

    if (existing) {
      throw new BadRequestException('This time slot is already booked');
    }

    const { roomName, token, jitsiUrl } =
      this.jitsiService.generateRoomAndToken({
        classId: `temp-${Date.now()}`,
        userId: studentId,
        userName: 'Student',
      });

    const scheduledClass = this.classRepo.create({
      teacherId: dto.teacherId,
      studentId,
      organizationId,
      startTime,
      endTime,
      topic: dto.topic,
      jitsiRoom: roomName,
      status: ClassStatus.PENDING,
    });

    return this.classRepo.save(scheduledClass);
  }

  async getUpcomingClasses(
    studentId: string,
    days = 7,
  ): Promise<ScheduledClass[]> {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.classRepo.find({
      where: {
        studentId,
        startTime: Between(now, future),
        status: In([ClassStatus.PENDING, ClassStatus.CONFIRMED]),
      },
      order: { startTime: 'ASC' },
    });
  }

  async getClassById(classId: string): Promise<ScheduledClass> {
    const classEntity = await this.classRepo.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    return classEntity;
  }

  async joinClass(
    classId: string,
    userId: string,
    userName: string,
  ): Promise<JoinClassResponseDto> {
    const classEntity = await this.getClassById(classId);

    if (classEntity.studentId !== userId && classEntity.teacherId !== userId) {
      throw new ForbiddenException('You are not part of this class');
    }

    if (new Date() < classEntity.startTime) {
      throw new BadRequestException('Class has not started yet');
    }

    const isHost = classEntity.teacherId === userId;
    const { roomName, token, jitsiUrl } =
      this.jitsiService.generateRoomAndToken({
        classId,
        userId,
        userName,
        isHost,
      });

    classEntity.jitsiRoom = roomName;
    classEntity.status = ClassStatus.IN_PROGRESS;
    await this.classRepo.save(classEntity);

    return { roomName, token, jitsiUrl };
  }

  async completeClass(
    classId: string,
    teacherId: string,
  ): Promise<ScheduledClass> {
    const classEntity = await this.getClassById(classId);

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Only the teacher can complete the class');
    }

    classEntity.status = ClassStatus.COMPLETED;
    return this.classRepo.save(classEntity);
  }

  async cancelClass(
    classId: string,
    userId: string,
    reason?: string,
  ): Promise<ScheduledClass> {
    const classEntity = await this.getClassById(classId);

    const isTeacherOrStudent =
      classEntity.teacherId === userId || classEntity.studentId === userId;

    if (!isTeacherOrStudent) {
      throw new ForbiddenException('You cannot cancel this class');
    }

    const hoursUntilStart =
      (classEntity.startTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilStart < 24 && classEntity.teacherId === userId) {
      throw new BadRequestException(
        'Cannot cancel within 24 hours of class start',
      );
    }

    classEntity.status = ClassStatus.CANCELLED;
    classEntity.cancelledAt = new Date();
    classEntity.cancelReason = reason || '';
    return this.classRepo.save(classEntity);
  }

  async getClassHistory(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ScheduledClass[]; total: number }> {
    const [data, total] = await this.classRepo.findAndCount({
      where: [{ teacherId: userId }, { studentId: userId }],
      order: { startTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async addClassNotes(
    classId: string,
    teacherId: string,
    dto: ClassNotesDto,
  ): Promise<ScheduledClass> {
    const classEntity = await this.getClassById(classId);

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Only the teacher can add notes');
    }

    Object.assign(classEntity, {
      notes: dto.notes,
      homeworkUrl: dto.homeworkUrl,
      homeworkDescription: dto.homeworkDescription,
    });

    return this.classRepo.save(classEntity);
  }

  async getRecording(
    classId: string,
    userId: string,
  ): Promise<RecordingResponseDto> {
    const classEntity = await this.getClassById(classId);

    if (classEntity.studentId !== userId && classEntity.teacherId !== userId) {
      throw new ForbiddenException('You are not part of this class');
    }

    if (!classEntity.recordingEnabled || !classEntity.recordingKey) {
      throw new NotFoundException('Recording not available');
    }

    const expiresAt = new Date(Date.now() + 3600 * 1000);
    const playbackUrl = await this.minioService.getSignedDownloadUrl(
      classEntity.recordingKey,
      3600,
    );

    return { playbackUrl, expiresAt };
  }

  async submitFeedback(
    classId: string,
    userId: string,
    dto: ClassFeedbackDto,
  ): Promise<ScheduledClass> {
    const classEntity = await this.getClassById(classId);

    const isTeacher = classEntity.teacherId === userId;
    const isStudent = classEntity.studentId === userId;

    if (!isTeacher && !isStudent) {
      throw new ForbiddenException('You are not part of this this class');
    }

    if (isTeacher) {
      classEntity.teacherRating = dto.rating;
      classEntity.teacherComment = dto.comment || '';
      classEntity.teacherFeedbackAt = new Date();
    } else {
      classEntity.studentRating = dto.rating;
      classEntity.studentComment = dto.comment || '';
      classEntity.studentFeedbackAt = new Date();
    }

    if (
      classEntity.teacherFeedbackAt &&
      classEntity.studentFeedbackAt &&
      classEntity.status !== ClassStatus.COMPLETED
    ) {
      classEntity.status = ClassStatus.COMPLETED;
    }

    return this.classRepo.save(classEntity);
  }

  async toggleRecording(
    classId: string,
    teacherId: string,
    enabled: boolean,
  ): Promise<ScheduledClass> {
    const classEntity = await this.getClassById(classId);

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Only the teacher can toggle recording');
    }

    classEntity.recordingEnabled = enabled;
    if (enabled) {
      classEntity.recordingKey = this.minioService.getRecordingKey(classId);
    }

    return this.classRepo.save(classEntity);
  }

  async generateIcalFeed(userId: string): Promise<string> {
    const classes = await this.classRepo.find({
      where: [{ teacherId: userId }, { studentId: userId }],
      order: { startTime: 'ASC' },
    });

    let ical =
      'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Quran Academy//NONSGML v1.0//EN\r\n';

    for (const cls of classes) {
      const uid = `${cls.id}@quran-academy.com`;
      const dtstart =
        cls.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtend =
        cls.endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const summary = `Quran Class${cls.topic ? `: ${cls.topic}` : ''}`;
      const description = cls.notes || '';

      ical += `BEGIN:VEVENT\r\n`;
      ical += `UID:${uid}\r\n`;
      ical += `DTSTART:${dtstart}\r\n`;
      ical += `DTEND:${dtend}\r\n`;
      ical += `SUMMARY:${summary}\r\n`;
      ical += `DESCRIPTION:${description}\r\n`;
      ical += `END:VEVENT\r\n`;
    }

    ical += 'END:VCALENDAR\r\n';
    return ical;
  }
}
