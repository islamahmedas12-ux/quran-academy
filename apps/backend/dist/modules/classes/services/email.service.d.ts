import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly fromAddress;
    constructor(configService: ConfigService);
    sendClassConfirmation(params: {
        teacherEmail: string;
        studentEmail: string;
        teacherName: string;
        studentName: string;
        startTime: Date;
        topic?: string;
        jitsiUrl?: string;
    }): Promise<void>;
    sendClassNotes(params: {
        studentEmail: string;
        studentName: string;
        teacherName: string;
        startTime: Date;
        notes?: string;
        homeworkUrl?: string;
        homeworkDescription?: string;
    }): Promise<void>;
    private send;
}
