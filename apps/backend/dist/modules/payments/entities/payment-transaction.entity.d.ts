import { User } from '../../users/entities/user.entity';
export declare enum TransactionType {
    CLASS_PAYMENT = "class_payment",
    COURSE_REVENUE = "course_revenue",
    PLATFORM_FEE = "platform_fee",
    PAYOUT = "payout"
}
export declare class PaymentTransaction {
    id: string;
    organizationId: string;
    teacherId: string;
    teacher: User;
    stripePaymentIntentId: string;
    stripeInvoiceId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
