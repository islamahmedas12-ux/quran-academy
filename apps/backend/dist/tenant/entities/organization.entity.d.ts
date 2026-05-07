import { SubscriptionTier } from '../../../shared/constants/enums';
export declare class Organization {
    id: string;
    name: string;
    slug: string;
    schemaName: string;
    settings: Record<string, any>;
    subscriptionTier: SubscriptionTier;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
