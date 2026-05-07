import { ClassStatus } from '../../../shared/constants/enums';
export declare class ScheduledClass {
    id: string;
    teacherId: string;
    studentId: string;
    organizationId: string;
    startTime: Date;
    endTime: Date;
    status: ClassStatus;
    topic: string;
    jitsiRoom: string;
    notes: string;
    homeworkUrl: string;
    homeworkDescription: string;
    recordingEnabled: boolean;
    recordingKey: string;
    teacherRating: number;
    teacherComment: string;
    teacherFeedbackAt: Date;
    studentRating: number;
    studentComment: string;
    studentFeedbackAt: Date;
    cancelledAt: Date;
    cancelReason: string;
    createdAt: Date;
    updatedAt: Date;
}
