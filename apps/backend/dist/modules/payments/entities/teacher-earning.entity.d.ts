import { User } from '../../users/entities/user.entity';
export declare enum TeacherEarningStatus {
    PENDING = "pending",
    PAID = "paid"
}
export declare class TeacherEarning {
    id: string;
    teacherId: string;
    teacher: User;
    month: number;
    year: number;
    grossAmount: number;
    platformFee: number;
    netAmount: number;
    status: TeacherEarningStatus;
    paidAt: Date;
    createdAt: Date;
}
