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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = StripeService_1 = class StripeService {
    configService;
    logger = new common_1.Logger(StripeService_1.name);
    stripe;
    constructor(configService) {
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY', ''), {
            apiVersion: '2025-02-24.acacia',
        });
    }
    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata) {
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata,
        });
        return {
            sessionId: session.id,
            url: session.url,
        };
    }
    async createCustomer(email, name, organizationId) {
        const customer = await this.stripe.customers.create({
            email,
            name,
            metadata: {
                organizationId,
            },
        });
        return customer.id;
    }
    async createSubscription(customerId, priceId, metadata) {
        const subscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
            metadata,
        });
        return subscription.id;
    }
    async cancelSubscription(subscriptionId) {
        await this.stripe.subscriptions.cancel(subscriptionId);
    }
    async updateSubscription(subscriptionId, priceId) {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        await this.stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: priceId,
                },
            ],
        });
        return this.stripe.subscriptions.retrieve(subscriptionId);
    }
    async getCustomerPortal(customerId, returnUrl) {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return session.url;
    }
    async getSubscription(subscriptionId) {
        return this.stripe.subscriptions.retrieve(subscriptionId);
    }
    async constructWebhookEvent(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET', '');
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map