export declare class BookClassDto {
    teacherId: string;
    selectedSlot: string;
    topic?: string;
}
export declare class UpdateAvailabilityDto {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
    specificDate?: string;
    isActive?: boolean;
}
export declare class CreateAvailabilityDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring?: boolean;
    specificDate?: string;
    isActive?: boolean;
}
export declare class ClassNotesDto {
    notes?: string;
    homeworkUrl?: string;
    homeworkDescription?: string;
}
export declare class ClassFeedbackDto {
    rating: number;
    comment?: string;
}
export declare class JoinClassResponseDto {
    roomName: string;
    token: string;
    jitsiUrl: string;
}
export declare class RecordingResponseDto {
    playbackUrl: string;
    expiresAt: Date;
}
export declare class AvailabilityQueryDto {
    fromDate?: string;
    toDate?: string;
}
