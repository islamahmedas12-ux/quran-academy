export declare class CreateLessonDto {
    title: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
    order?: number;
    content?: string;
    attachments?: string[];
    isFree?: boolean;
}
export declare class UpdateLessonDto {
    title?: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
    order?: number;
    content?: string;
    attachments?: string[];
    isFree?: boolean;
}
export declare class LessonOrderDto {
    order: number;
}
