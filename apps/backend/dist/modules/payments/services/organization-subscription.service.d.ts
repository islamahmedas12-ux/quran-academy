import { Repository } from 'typeorm';
import { OrganizationSubscription } from '../entities/organization-subscription.entity';
import { SubscriptionTierType } from '../entities/subscription-tier.entity';
import { StripeService } from './stripe.service';
import { SubscriptionTiersService } from './subscription-tiers.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { ConfigService } from '@nestjs/config';
export declare class OrganizationSubscriptionsService {
    private readonly subscriptionRepository;
    private readonly stripeService;
    private readonly tiersService;
    private readonly organizationsService;
    private readonly configService;
    private readonly logger;
    private readonly platformFeePercent;
    constructor(subscriptionRepository: Repository<OrganizationSubscription>, stripeService: StripeService, tiersService: SubscriptionTiersService, organizationsService: OrganizationsService, configService: ConfigService);
    getOrCreateSubscription(organizationId: string): Promise<OrganizationSubscription>;
    createCheckout(organizationId: string, tierType: SubscriptionTierType, successUrl?: string, cancelUrl?: string): Promise<{
        checkoutUrl: string;
    }>;
    updateSubscription(organizationId: string, tierType: SubscriptionTierType): Promise<OrganizationSubscription>;
    cancelSubscription(organizationId: string): Promise<void>;
    getCustomerPortal(organizationId: string, returnUrl?: string): Promise<{
        portalUrl: string;
    }>;
    handleWebhook(event: any): Promise<void>;
    private activateSubscription;
    private updateSubscriptionStatus;
    private deactivateSubscription;
    private handlePaymentFailed;
    private mapStripeStatus;
}
