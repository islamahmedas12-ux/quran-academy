import { SubscriptionTiersService } from './services/subscription-tiers.service';
import { OrganizationSubscriptionsService } from './services/organization-subscription.service';
import { TeacherPayoutsService } from './services/teacher-payouts.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { UserRole } from '../users/entities/user.entity';
interface RequestWithUser extends Request {
    user: {
        id: string;
        role: UserRole;
        [key: string]: any;
    };
}
export declare class PaymentsController {
    private readonly tiersService;
    private readonly subscriptionsService;
    private readonly payoutsService;
    constructor(tiersService: SubscriptionTiersService, subscriptionsService: OrganizationSubscriptionsService, payoutsService: TeacherPayoutsService);
    listPlans(): Promise<import("./entities").SubscriptionTier[]>;
    createSubscription(id: string, dto: CreateSubscriptionDto): Promise<{
        checkoutUrl: string;
    }>;
    updateSubscription(id: string, dto: UpdateSubscriptionDto): Promise<import("./entities").OrganizationSubscription>;
    getSubscription(id: string): Promise<import("./entities").OrganizationSubscription>;
    cancelSubscription(id: string): Promise<{
        success: boolean;
    }>;
    getCustomerPortal(id: string): Promise<{
        portalUrl: string;
    }>;
    handleStripeWebhook(signature: string, body: any): Promise<{
        received: boolean;
    }>;
    getTeacherEarnings(id: string, req: RequestWithUser): Promise<import("./entities").TeacherEarning[] | {
        error: string;
    }>;
    getEarningsSummary(id: string, req: RequestWithUser): Promise<{
        totalGross: number;
        totalNet: number;
        totalPending: number;
        totalPaid: number;
    } | {
        error: string;
    }>;
    markEarningsPaid(id: string, month: number, year: number): Promise<import("./entities").TeacherEarning>;
}
export {};
