import { CourseCategory, CourseDifficulty } from '../entities/course.entity';
export declare class CreateCourseDto {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    category?: CourseCategory;
    language?: string;
    difficulty?: CourseDifficulty;
    prerequisites?: string[];
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    category?: CourseCategory;
    language?: string;
    difficulty?: CourseDifficulty;
    prerequisites?: string[];
    isPublished?: boolean;
}
export declare class CourseQueryDto {
    category?: CourseCategory;
    language?: string;
    difficulty?: CourseDifficulty;
    search?: string;
}
