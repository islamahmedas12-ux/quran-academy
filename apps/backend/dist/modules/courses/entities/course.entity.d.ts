import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Lesson } from './lesson.entity';
import { Enrollment } from './enrollment.entity';
export declare enum CourseDifficulty {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export declare enum CourseCategory {
    TAJWEED = "tajweed",
    QIRAAT = "qiraat",
    TAFSIR = "tafsir",
    HIFZ = "hifz",
    ARABIC = "arabic",
    ISLAMIC_STUDIES = "islamic_studies",
    OTHER = "other"
}
export declare class Course {
    id: string;
    organizationId: string;
    organization: Organization;
    title: string;
    description: string;
    thumbnailUrl: string;
    category: CourseCategory;
    language: string;
    difficulty: CourseDifficulty;
    duration: number;
    instructorId: string;
    instructor: User;
    prerequisites: string[];
    isPublished: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    lessons: Lesson[];
    enrollments: Enrollment[];
}
