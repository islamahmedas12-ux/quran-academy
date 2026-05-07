import { CoursesService } from './services/course.service';
import { LessonsService } from './services/lesson.service';
import { EnrollmentsService } from './services/enrollment.service';
import { CertificateService } from './services/certificate.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './dto/course.dto';
import { CreateLessonDto, UpdateLessonDto, LessonOrderDto } from './dto/lesson.dto';
import { UpdateProgressDto } from './dto/enrollment.dto';
interface RequestWithUser extends Request {
    user: {
        id: string;
        [key: string]: any;
    };
}
export declare class CoursesController {
    private readonly coursesService;
    private readonly lessonsService;
    private readonly enrollmentsService;
    private readonly certificateService;
    constructor(coursesService: CoursesService, lessonsService: LessonsService, enrollmentsService: EnrollmentsService, certificateService: CertificateService);
    listCourses(query: CourseQueryDto): Promise<import("./entities").Course[]>;
    getCourse(id: string): Promise<import("./entities").Course>;
    createCourse(dto: CreateCourseDto, req: RequestWithUser): Promise<import("./entities").Course>;
    updateCourse(id: string, dto: UpdateCourseDto, req: RequestWithUser): Promise<import("./entities").Course>;
    deleteCourse(id: string, req: RequestWithUser): Promise<{
        success: boolean;
    }>;
    publishCourse(id: string, req: RequestWithUser): Promise<import("./entities").Course>;
    listLessons(courseId: string): Promise<import("./entities").Lesson[]>;
    getLesson(id: string): Promise<import("./entities").Lesson>;
    getLessonVideo(id: string, req: RequestWithUser): Promise<{
        videoUrl: string;
    }>;
    createLesson(dto: CreateLessonDto & {
        courseId: string;
    }, req: RequestWithUser): Promise<import("./entities").Lesson>;
    updateLesson(id: string, dto: UpdateLessonDto, req: RequestWithUser): Promise<import("./entities").Lesson>;
    reorderLesson(id: string, dto: LessonOrderDto, req: RequestWithUser): Promise<import("./entities").Lesson>;
    deleteLesson(id: string, req: RequestWithUser): Promise<{
        success: boolean;
    }>;
    getUploadUrl(id: string, req: RequestWithUser): Promise<{
        uploadUrl: string;
        bucket: string;
        key: string;
    }>;
    enroll(body: {
        courseId: string;
    }, req: RequestWithUser): Promise<import("./entities").Enrollment>;
    myEnrollments(req: RequestWithUser): Promise<import("./entities").Enrollment[]>;
    getEnrollment(id: string, req: RequestWithUser): Promise<import("./entities").Enrollment>;
    unenroll(id: string, req: RequestWithUser): Promise<{
        success: boolean;
    }>;
    updateProgress(id: string, dto: UpdateProgressDto, req: RequestWithUser): Promise<import("./entities").LessonProgress>;
    getProgress(id: string, req: RequestWithUser): Promise<import("./entities").LessonProgress[]>;
    generateCertificate(id: string, req: RequestWithUser): Promise<import("./entities").Certificate>;
    getCertificate(id: string, req: RequestWithUser): Promise<{
        certificateUrl: string;
    }>;
}
export {};
