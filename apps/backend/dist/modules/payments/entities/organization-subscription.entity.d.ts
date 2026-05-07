import { Organization } from '../../organizations/entities/organization.entity';
import { SubscriptionTierType } from './subscription-tier.entity';
export declare enum OrganizationSubscriptionStatus {
    ACTIVE = "active",
    PAST_DUE = "past_due",
    CANCELED = "canceled",
    TRIALING = "trialing"
}
export declare class OrganizationSubscription {
    id: string;
    organizationId: string;
    organization: Organization;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: OrganizationSubscriptionStatus;
    tierType: SubscriptionTierType;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
}
