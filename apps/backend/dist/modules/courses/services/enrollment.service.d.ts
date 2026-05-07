import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { LessonProgress } from '../entities/lesson-progress.entity';
import { Course } from '../entities/course.entity';
import { UpdateProgressDto } from '../dto/enrollment.dto';
import { UsersService } from '../../users/users.service';
import { OrganizationsService } from '../../organizations/organizations.service';
export declare class EnrollmentsService {
    private readonly enrollmentRepository;
    private readonly lessonProgressRepository;
    private readonly courseRepository;
    private readonly usersService;
    private readonly organizationsService;
    private readonly logger;
    constructor(enrollmentRepository: Repository<Enrollment>, lessonProgressRepository: Repository<LessonProgress>, courseRepository: Repository<Course>, usersService: UsersService, organizationsService: OrganizationsService);
    enroll(studentId: string, courseId: string): Promise<Enrollment>;
    findMyEnrollments(studentId: string): Promise<Enrollment[]>;
    findOne(id: string, userId: string): Promise<Enrollment>;
    unenroll(id: string, userId: string): Promise<void>;
    updateProgress(enrollmentId: string, userId: string, dto: UpdateProgressDto): Promise<LessonProgress>;
    getProgress(enrollmentId: string, userId: string): Promise<LessonProgress[]>;
    private updateEnrollmentProgress;
}
