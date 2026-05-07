import { Course } from './course.entity';
export declare class Lesson {
    id: string;
    courseId: string;
    course: Course;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    content: string;
    attachments: string[];
    isFree: boolean;
    createdAt: Date;
    updatedAt: Date;
}
