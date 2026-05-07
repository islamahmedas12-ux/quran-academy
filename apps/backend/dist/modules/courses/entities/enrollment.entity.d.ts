import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';
import { LessonProgress } from './lesson-progress.entity';
export declare class Enrollment {
    id: string;
    studentId: string;
    student: User;
    courseId: string;
    course: Course;
    enrolledAt: Date;
    completedAt: Date;
    progress: number;
    lessonProgress: LessonProgress[];
}
