import { Enrollment } from './enrollment.entity';
import { Lesson } from './lesson.entity';
export declare class LessonProgress {
    id: string;
    enrollmentId: string;
    enrollment: Enrollment;
    lessonId: string;
    lesson: Lesson;
    watchedDuration: number;
    isCompleted: boolean;
    completedAt: Date;
    createdAt: Date;
}
