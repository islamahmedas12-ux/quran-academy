import { Repository } from 'typeorm';
import { TeacherEarning } from '../entities/teacher-earning.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
export declare class TeacherPayoutsService {
    private readonly earningRepository;
    private readonly transactionRepository;
    private readonly logger;
    private readonly platformFeePercent;
    constructor(earningRepository: Repository<TeacherEarning>, transactionRepository: Repository<PaymentTransaction>);
    getTeacherEarnings(teacherId: string, year?: number): Promise<TeacherEarning[]>;
    calculateEarnings(teacherId: string, month: number, year: number): Promise<TeacherEarning>;
    markAsPaid(teacherId: string, month: number, year: number): Promise<TeacherEarning>;
    recordClassPayment(teacherId: string, organizationId: string, classId: string, amount: number): Promise<void>;
    getEarningsSummary(teacherId: string): Promise<{
        totalGross: number;
        totalNet: number;
        totalPending: number;
        totalPaid: number;
    }>;
}
