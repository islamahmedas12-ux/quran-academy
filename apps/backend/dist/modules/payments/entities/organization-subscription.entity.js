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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationSubscription = exports.OrganizationSubscriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const subscription_tier_entity_1 = require("./subscription-tier.entity");
var OrganizationSubscriptionStatus;
(function (OrganizationSubscriptionStatus) {
    OrganizationSubscriptionStatus["ACTIVE"] = "active";
    OrganizationSubscriptionStatus["PAST_DUE"] = "past_due";
    OrganizationSubscriptionStatus["CANCELED"] = "canceled";
    OrganizationSubscriptionStatus["TRIALING"] = "trialing";
})(OrganizationSubscriptionStatus || (exports.OrganizationSubscriptionStatus = OrganizationSubscriptionStatus = {}));
let OrganizationSubscription = class OrganizationSubscription {
    id;
    organizationId;
    organization;
    stripeCustomerId;
    stripeSubscriptionId;
    status;
    tierType;
    currentPeriodStart;
    currentPeriodEnd;
    cancelAtPeriodEnd;
    createdAt;
    updatedAt;
};
exports.OrganizationSubscription = OrganizationSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrganizationSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id' }),
    __metadata("design:type", String)
], OrganizationSubscription.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], OrganizationSubscription.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_customer_id', nullable: true }),
    __metadata("design:type", String)
], OrganizationSubscription.prototype, "stripeCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_subscription_id', nullable: true }),
    __metadata("design:type", String)
], OrganizationSubscription.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrganizationSubscriptionStatus,
        default: OrganizationSubscriptionStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], OrganizationSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier_type', type: 'enum', enum: subscription_tier_entity_1.SubscriptionTierType }),
    __metadata("design:type", String)
], OrganizationSubscription.prototype, "tierType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_period_start', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], OrganizationSubscription.prototype, "currentPeriodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_period_end', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], OrganizationSubscription.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancel_at_period_end', default: false }),
    __metadata("design:type", Boolean)
], OrganizationSubscription.prototype, "cancelAtPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OrganizationSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], OrganizationSubscription.prototype, "updatedAt", void 0);
exports.OrganizationSubscription = OrganizationSubscription = __decorate([
    (0, typeorm_1.Entity)('organization_subscriptions')
], OrganizationSubscription);
//# sourceMappingURL=organization-subscription.entity.js.map