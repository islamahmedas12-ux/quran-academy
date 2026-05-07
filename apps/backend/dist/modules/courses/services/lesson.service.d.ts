import { Repository } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';
import { Course } from '../entities/course.entity';
import { CreateLessonDto, UpdateLessonDto } from '../dto/lesson.dto';
import { UsersService } from '../../users/users.service';
import { MinioService } from '../../../shared/services/minio.service';
export declare class LessonsService {
    private readonly lessonRepository;
    private readonly courseRepository;
    private readonly usersService;
    private readonly minioService;
    private readonly logger;
    constructor(lessonRepository: Repository<Lesson>, courseRepository: Repository<Course>, usersService: UsersService, minioService: MinioService);
    findByCourse(courseId: string): Promise<Lesson[]>;
    findOne(id: string): Promise<Lesson>;
    getSignedVideoUrl(id: string, userId: string): Promise<string>;
    create(courseId: string, dto: CreateLessonDto): Promise<Lesson>;
    update(id: string, userId: string, dto: UpdateLessonDto): Promise<Lesson>;
    delete(id: string, userId: string): Promise<void>;
    reorderLesson(id: string, newOrder: number): Promise<Lesson>;
    getUploadUrl(lessonId: string, userId: string): Promise<{
        uploadUrl: string;
        bucket: string;
        key: string;
    }>;
    updateVideoUrl(lessonId: string, videoUrl: string): Promise<Lesson>;
    private reorderLessons;
    private checkUserAccess;
    private checkUserPermission;
}
