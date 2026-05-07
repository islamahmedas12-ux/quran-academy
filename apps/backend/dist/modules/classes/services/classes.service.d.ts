import { Repository } from 'typeorm';
import { ScheduledClass } from '../entities/scheduled-class.entity';
import { BookClassDto, ClassNotesDto, ClassFeedbackDto, JoinClassResponseDto, RecordingResponseDto } from '../dtos/class.dtos';
import { JitsiService } from './jitsi.service';
import { MinioService } from './minio.service';
import { EmailService } from './email.service';
import { AvailabilityService } from './availability.service';
export declare class ClassesService {
    private readonly classRepo;
    private readonly jitsiService;
    private readonly minioService;
    private readonly emailService;
    private readonly availabilityService;
    private readonly logger;
    constructor(classRepo: Repository<ScheduledClass>, jitsiService: JitsiService, minioService: MinioService, emailService: EmailService, availabilityService: AvailabilityService);
    bookClass(studentId: string, organizationId: string, dto: BookClassDto): Promise<ScheduledClass>;
    getUpcomingClasses(studentId: string, days?: number): Promise<ScheduledClass[]>;
    getClassById(classId: string): Promise<ScheduledClass>;
    joinClass(classId: string, userId: string, userName: string): Promise<JoinClassResponseDto>;
    completeClass(classId: string, teacherId: string): Promise<ScheduledClass>;
    cancelClass(classId: string, userId: string, reason?: string): Promise<ScheduledClass>;
    getClassHistory(userId: string, page?: number, limit?: number): Promise<{
        data: ScheduledClass[];
        total: number;
    }>;
    addClassNotes(classId: string, teacherId: string, dto: ClassNotesDto): Promise<ScheduledClass>;
    getRecording(classId: string, userId: string): Promise<RecordingResponseDto>;
    submitFeedback(classId: string, userId: string, dto: ClassFeedbackDto): Promise<ScheduledClass>;
    toggleRecording(classId: string, teacherId: string, enabled: boolean): Promise<ScheduledClass>;
    generateIcalFeed(userId: string): Promise<string>;
}
