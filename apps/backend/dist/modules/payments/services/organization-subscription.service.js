"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrganizationSubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationSubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_subscription_entity_1 = require("../entities/organization-subscription.entity");
const subscription_tier_entity_1 = require("../entities/subscription-tier.entity");
const stripe_service_1 = require("./stripe.service");
const subscription_tiers_service_1 = require("./subscription-tiers.service");
const organizations_service_1 = require("../../organizations/organizations.service");
const config_1 = require("@nestjs/config");
let OrganizationSubscriptionsService = OrganizationSubscriptionsService_1 = class OrganizationSubscriptionsService {
    subscriptionRepository;
    stripeService;
    tiersService;
    organizationsService;
    configService;
    logger = new common_1.Logger(OrganizationSubscriptionsService_1.name);
    platformFeePercent = 15;
    constructor(subscriptionRepository, stripeService, tiersService, organizationsService, configService) {
        this.subscriptionRepository = subscriptionRepository;
        this.stripeService = stripeService;
        this.tiersService = tiersService;
        this.organizationsService = organizationsService;
        this.configService = configService;
    }
    async getOrCreateSubscription(organizationId) {
        let subscription = await this.subscriptionRepository.findOne({
            where: { organizationId },
        });
        if (!subscription) {
            subscription = this.subscriptionRepository.create({
                organizationId,
                tierType: subscription_tier_entity_1.SubscriptionTierType.FREE,
                status: organization_subscription_entity_1.OrganizationSubscriptionStatus.ACTIVE,
            });
            subscription = await this.subscriptionRepository.save(subscription);
        }
        return subscription;
    }
    async createCheckout(organizationId, tierType, successUrl, cancelUrl) {
        const org = await this.organizationsService.findOne(organizationId);
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const tier = await this.tiersService.findOne(tierType);
        let customerId = org.stripeCustomerId;
        if (!customerId) {
            customerId = await this.stripeService.createCustomer(org.email, org.name, organizationId);
            await this.organizationsService.updateStripeCustomerId(organizationId, customerId);
        }
        const defaultSuccessUrl = this.configService.get('FRONTEND_URL', '');
        const defaultCancelUrl = this.configService.get('FRONTEND_URL', '');
        const { url } = await this.stripeService.createCheckoutSession(customerId, `price_${tierType}`, successUrl || `${defaultSuccessUrl}/billing?success=true`, cancelUrl || `${defaultCancelUrl}/billing?canceled=true`, { organizationId, tierType });
        return { checkoutUrl: url };
    }
    async updateSubscription(organizationId, tierType) {
        const subscription = await this.getOrCreateSubscription(organizationId);
        if (!subscription.stripeSubscriptionId) {
            throw new common_1.NotFoundException('No active subscription to update');
        }
        const tier = await this.tiersService.findOne(tierType);
        await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, `price_${tierType}`);
        subscription.tierType = tierType;
        return this.subscriptionRepository.save(subscription);
    }
    async cancelSubscription(organizationId) {
        const subscription = await this.getOrCreateSubscription(organizationId);
        if (subscription.stripeSubscriptionId) {
            await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
        }
        subscription.tierType = subscription_tier_entity_1.SubscriptionTierType.FREE;
        subscription.stripeSubscriptionId = null;
        subscription.status = organization_subscription_entity_1.OrganizationSubscriptionStatus.CANCELED;
        await this.subscriptionRepository.save(subscription);
    }
    async getCustomerPortal(organizationId, returnUrl) {
        const org = await this.organizationsService.findOne(organizationId);
        if (!org.stripeCustomerId) {
            throw new common_1.NotFoundException('No Stripe customer found');
        }
        const defaultReturnUrl = this.configService.get('FRONTEND_URL', '');
        const portalUrl = await this.stripeService.getCustomerPortal(org.stripeCustomerId, returnUrl || defaultReturnUrl);
        return { portalUrl };
    }
    async handleWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.activateSubscription(session);
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                await this.updateSubscriptionStatus(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await this.deactivateSubscription(subscription);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                await this.handlePaymentFailed(invoice);
                break;
            }
        }
    }
    async activateSubscription(session) {
        const organizationId = session.metadata?.organizationId;
        const tierType = session.metadata?.tierType;
        if (!organizationId || !tierType) {
            this.logger.warn('Missing metadata in checkout session');
            return;
        }
        let subscription = await this.getOrCreateSubscription(organizationId);
        subscription.stripeCustomerId = session.customer;
        subscription.stripeSubscriptionId = session.subscription;
        subscription.tierType = tierType;
        subscription.status = organization_subscription_entity_1.OrganizationSubscriptionStatus.ACTIVE;
        await this.subscriptionRepository.save(subscription);
        this.logger.log(`Activated subscription for organization ${organizationId}`);
    }
    async updateSubscriptionStatus(stripeSubscription) {
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
    async deactivateSubscription(stripeSubscription) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId: stripeSubscription.id },
        });
        if (!subscription) {
            return;
        }
        subscription.tierType = subscription_tier_entity_1.SubscriptionTierType.FREE;
        subscription.stripeSubscriptionId = null;
        subscription.status = organization_subscription_entity_1.OrganizationSubscriptionStatus.CANCELED;
        await this.subscriptionRepository.save(subscription);
        this.logger.log(`Deactivated subscription for organization ${subscription.organizationId}`);
    }
    async handlePaymentFailed(invoice) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { stripeCustomerId: invoice.customer },
        });
        if (!subscription) {
            return;
        }
        subscription.status = organization_subscription_entity_1.OrganizationSubscriptionStatus.PAST_DUE;
        await this.subscriptionRepository.save(subscription);
        this.logger.warn(`Payment failed for organization ${subscription.organizationId}`);
    }
    mapStripeStatus(status) {
        switch (status) {
            case 'active':
                return organization_subscription_entity_1.OrganizationSubscriptionStatus.ACTIVE;
            case 'past_due':
                return organization_subscription_entity_1.OrganizationSubscriptionStatus.PAST_DUE;
            case 'canceled':
                return organization_subscription_entity_1.OrganizationSubscriptionStatus.CANCELED;
            case 'trialing':
                return organization_subscription_entity_1.OrganizationSubscriptionStatus.TRIALING;
            default:
                return organization_subscription_entity_1.OrganizationSubscriptionStatus.ACTIVE;
        }
    }
};
exports.OrganizationSubscriptionsService = OrganizationSubscriptionsService;
exports.OrganizationSubscriptionsService = OrganizationSubscriptionsService = OrganizationSubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_subscription_entity_1.OrganizationSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        stripe_service_1.StripeService,
        subscription_tiers_service_1.SubscriptionTiersService,
        organizations_service_1.OrganizationsService,
        config_1.ConfigService])
], OrganizationSubscriptionsService);
//# sourceMappingURL=organization-subscription.service.js.map