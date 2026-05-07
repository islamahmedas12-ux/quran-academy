import { SubscriptionTierType } from '../entities/subscription-tier.entity';
export declare class CreateSubscriptionDto {
    organizationId: string;
    tierType: SubscriptionTierType;
    successUrl?: string;
    cancelUrl?: string;
}
export declare class UpdateSubscriptionDto {
    tierType: SubscriptionTierType;
    successUrl?: string;
    cancelUrl?: string;
}
