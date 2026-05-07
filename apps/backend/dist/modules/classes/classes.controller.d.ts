import { ClassesService } from './services/classes.service';
import { AvailabilityService } from './services/availability.service';
import { BookClassDto, UpdateAvailabilityDto, ClassNotesDto, ClassFeedbackDto, AvailabilityQueryDto } from './dtos/class.dtos';
export declare class ClassesController {
    private readonly classesService;
    private readonly availabilityService;
    constructor(classesService: ClassesService, availabilityService: AvailabilityService);
    bookClass(req: any, dto: BookClassDto): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    getUpcomingClasses(req: any, days?: string): Promise<import("./entities/scheduled-class.entity").ScheduledClass[]>;
    getClassHistory(req: any, page?: string, limit?: string): Promise<{
        data: import("./entities/scheduled-class.entity").ScheduledClass[];
        total: number;
    }>;
    getCalendarFeed(req: any): Promise<{
        content: string;
        headers: {
            'Content-Type': string;
            'Content-Disposition': string;
        };
    }>;
    getClass(id: string): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    joinClass(id: string, req: any): Promise<import("./dtos/class.dtos").JoinClassResponseDto>;
    completeClass(id: string, req: any): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    cancelClass(id: string, req: any, reason?: string): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    addNotes(id: string, req: any, dto: ClassNotesDto): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    getRecording(id: string, req: any): Promise<import("./dtos/class.dtos").RecordingResponseDto>;
    toggleRecording(id: string, req: any, enabled: boolean): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    submitFeedback(id: string, req: any, dto: ClassFeedbackDto): Promise<import("./entities/scheduled-class.entity").ScheduledClass>;
    getJitsiRoom(id: string, req: any): Promise<{
        roomName: string;
        token: string;
        jitsiUrl: string;
    }>;
}
export declare class TeachersController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    getTeacherAvailability(teacherId: string, query: AvailabilityQueryDto): Promise<import("./entities/availability-slot.entity").AvailabilitySlot[]>;
    updateAvailability(teacherId: string, req: any, dto: UpdateAvailabilityDto): Promise<import("./entities/availability-slot.entity").AvailabilitySlot>;
}
export declare class WebhooksController {
    handleGoogleCalendarWebhook(body: any): Promise<{
        received: boolean;
    }>;
}
