import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private readonly configService;
    private readonly logger;
    private readonly stripe;
    constructor(configService: ConfigService);
    createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string, metadata?: Record<string, string>): Promise<{
        sessionId: string;
        url: string;
    }>;
    createCustomer(email: string, name: string, organizationId: string): Promise<string>;
    createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<string>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription>;
    getCustomerPortal(customerId: string, returnUrl: string): Promise<string>;
    getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
    constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event>;
}
