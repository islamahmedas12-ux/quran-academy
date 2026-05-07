import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSubscription, OrganizationSubscriptionStatus } from '../entities/organization-subscription.entity';
import { SubscriptionTierType } from '../entities/subscription-tier.entity';
import { StripeService } from './stripe.service';
import { SubscriptionTiersService } from './subscription-tiers.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/services/redis.service';

@Injectable()
export class OrganizationSubscriptionsService {
  private readonly logger = new Logger(OrganizationSubscriptionsService.name);
  private readonly platformFeePercent = 15;

  constructor(
    @InjectRepository(OrganizationSubscription)
    private readonly subscriptionRepository: Repository<OrganizationSubscription>,
    private readonly stripeService: StripeService,
    private readonly tiersService: SubscriptionTiersService,
    private readonly organizationsService: OrganizationsService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async getOrCreateSubscription(organizationId: string): Promise<OrganizationSubscription> {
    let subscription = await this.subscriptionRepository.findOne({
      where: { organizationId },
    });

    if (!subscription) {
      subscription = this.subscriptionRepository.create({
        organizationId,
        tierType: SubscriptionTierType.FREE,
        status: OrganizationSubscriptionStatus.ACTIVE,
      });
      subscription = await this.subscriptionRepository.save(subscription);
    }

    return subscription;
  }

  async createCheckout(
    organizationId: string,
    tierType: SubscriptionTierType,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ checkoutUrl: string }> {
    const org = await this.organizationsService.findOne(organizationId);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const tier = await this.tiersService.findOne(tierType);

    if (!tier.stripePriceIdMonthly) {
      throw new NotFoundException(`Stripe price ID not configured for tier ${tierType}`);
    }

    let customerId = org.stripeCustomerId;
    if (!customerId) {
      customerId = await this.stripeService.createCustomer(
        org.email,
        org.name,
        organizationId,
      );
      await this.organizationsService.updateStripeCustomerId(organizationId, customerId);
    }

    const defaultSuccessUrl = this.configService.get<string>('FRONTEND_URL', '');
    const defaultCancelUrl = this.configService.get<string>('FRONTEND_URL', '');

    const { url } = await this.stripeService.createCheckoutSession(
      customerId,
      tier.stripePriceIdMonthly,
      successUrl || `${defaultSuccessUrl}/billing?success=true`,
      cancelUrl || `${defaultCancelUrl}/billing?canceled=true`,
      { organizationId, tierType },
    );

    return { checkoutUrl: url };
  }

  async updateSubscription(
    organizationId: string,
    tierType: SubscriptionTierType,
  ): Promise<OrganizationSubscription> {
    const subscription = await this.getOrCreateSubscription(organizationId);

    if (!subscription.stripeSubscriptionId) {
      throw new NotFoundException('No active subscription to update');
    }

    const tier = await this.tiersService.findOne(tierType);

    if (!tier.stripePriceIdMonthly) {
      throw new NotFoundException(`Stripe price ID not configured for tier ${tierType}`);
    }

    await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, tier.stripePriceIdMonthly);

    subscription.tierType = tierType;
    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(organizationId: string): Promise<void> {
    const subscription = await this.getOrCreateSubscription(organizationId);

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    subscription.tierType = SubscriptionTierType.FREE;
    subscription.stripeSubscriptionId = null;
    subscription.status = OrganizationSubscriptionStatus.CANCELED;
    await this.subscriptionRepository.save(subscription);
  }

  async getCustomerPortal(organizationId: string, returnUrl?: string): Promise<{ portalUrl: string }> {
    const org = await this.organizationsService.findOne(organizationId);

    if (!org.stripeCustomerId) {
      throw new NotFoundException('No Stripe customer found');
    }

    const defaultReturnUrl = this.configService.get<string>('FRONTEND_URL', '');
    const portalUrl = await this.stripeService.getCustomerPortal(
      org.stripeCustomerId,
      returnUrl || defaultReturnUrl,
    );

    return { portalUrl };
  }

  async getSubscriptionWithOwnershipCheck(organizationId: string, userId: string, userRole: string): Promise<OrganizationSubscription> {
    const subscription = await this.getOrCreateSubscription(organizationId);

    if (userRole !== 'super_admin') {
      const org = await this.organizationsService.findOne(organizationId);
      if (!org) {
        throw new NotFoundException('Organization not found');
      }
      if (org.ownerId !== userId) {
        throw new ForbiddenException('You do not have access to this organization\'s subscription');
      }
    }

    return subscription;
  }

  async cancelSubscriptionWithOwnershipCheck(organizationId: string, userId: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin') {
      const org = await this.organizationsService.findOne(organizationId);
      if (!org) {
        throw new NotFoundException('Organization not found');
      }
      if (org.ownerId !== userId) {
        throw new ForbiddenException('You do not have access to this organization\'s subscription');
      }
    }

    await this.cancelSubscription(organizationId);
  }

  async verifyAndHandleWebhook(payload: Buffer, signature: string): Promise<any> {
    const event = await this.stripeService.constructWebhookEvent(payload, signature);
    return this.handleWebhook(event);
  }

  private readonly WEBHOOK_IDEMPOTENCY_TTL = 86400;

  async handleWebhook(event: Stripe.Event): Promise<void> {
    const idempotencyKey = `webhook:${event.id}`;
    const existing = await this.redisService.get('system', idempotencyKey);

    if (existing) {
      this.logger.warn(`Webhook event ${event.id} already processed, skipping`);
      return;
    }

    await this.redisService.set('system', idempotencyKey, '1', this.WEBHOOK_IDEMPOTENCY_TTL);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.activateSubscription(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionStatus(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.deactivateSubscription(subscription);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }
    }
  }

  private async activateSubscription(session: any): Promise<void> {
    const organizationId = session.metadata?.organizationId;
    const tierType = session.metadata?.tierType;

    if (!organizationId || !tierType) {
      this.logger.warn('Missing metadata in checkout session');
      return;
    }

    let subscription = await this.getOrCreateSubscription(organizationId);

    subscription.stripeCustomerId = session.customer;
    subscription.stripeSubscriptionId = session.subscription;
    subscription.tierType = tierType as SubscriptionTierType;
    subscription.status = OrganizationSubscriptionStatus.ACTIVE;

    await this.subscriptionRepository.save(subscription);
    this.logger.log(`Activated subscription for organization ${organizationId}`);
  }

  private async updateSubscriptionStatus(stripeSubscription: any): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      return;
    }

    subscription.status = this.mapStripeStatus(stripeSubscription.status);
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    await this.subscriptionRepository.save(subscription);
  }

  private async deactivateSubscription(stripeSubscription: any): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      return;
    }

    subscription.tierType = SubscriptionTierType.FREE;
    subscription.stripeSubscriptionId = null;
    subscription.status = OrganizationSubscriptionStatus.CANCELED;

    await this.subscriptionRepository.save(subscription);
    this.logger.log(`Deactivated subscription for organization ${subscription.organizationId}`);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeCustomerId: invoice.customer },
    });

    if (!subscription) {
      return;
    }

    subscription.status = OrganizationSubscriptionStatus.PAST_DUE;
    await this.subscriptionRepository.save(subscription);

    this.logger.warn(`Payment failed for organization ${subscription.organizationId}`);
  }

  private mapStripeStatus(status: string): OrganizationSubscriptionStatus {
    switch (status) {
      case 'active':
        return OrganizationSubscriptionStatus.ACTIVE;
      case 'past_due':
        return OrganizationSubscriptionStatus.PAST_DUE;
      case 'canceled':
        return OrganizationSubscriptionStatus.CANCELED;
      case 'trialing':
        return OrganizationSubscriptionStatus.TRIALING;
      default:
        return OrganizationSubscriptionStatus.ACTIVE;
    }
  }
}
