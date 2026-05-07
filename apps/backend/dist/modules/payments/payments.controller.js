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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const subscription_tiers_service_1 = require("./services/subscription-tiers.service");
const organization_subscription_service_1 = require("./services/organization-subscription.service");
const teacher_payouts_service_1 = require("./services/teacher-payouts.service");
const subscription_dto_1 = require("./dto/subscription.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const decorators_1 = require("../../shared/decorators");
const user_entity_1 = require("../users/entities/user.entity");
let PaymentsController = class PaymentsController {
    tiersService;
    subscriptionsService;
    payoutsService;
    constructor(tiersService, subscriptionsService, payoutsService) {
        this.tiersService = tiersService;
        this.subscriptionsService = subscriptionsService;
        this.payoutsService = payoutsService;
    }
    async listPlans() {
        return this.tiersService.findAll();
    }
    async createSubscription(id, dto) {
        return this.subscriptionsService.createCheckout(id, dto.tierType, dto.successUrl, dto.cancelUrl);
    }
    async updateSubscription(id, dto) {
        return this.subscriptionsService.updateSubscription(id, dto.tierType);
    }
    async getSubscription(id) {
        return this.subscriptionsService.getOrCreateSubscription(id);
    }
    async cancelSubscription(id) {
        await this.subscriptionsService.cancelSubscription(id);
        return { success: true };
    }
    async getCustomerPortal(id) {
        return this.subscriptionsService.getCustomerPortal(id);
    }
    async handleStripeWebhook(signature, body) {
        await this.subscriptionsService.handleWebhook(body);
        return { received: true };
    }
    async getTeacherEarnings(id, req) {
        const user = req.user;
        if (user.id !== id && user.role !== user_entity_1.UserRole.ORG_ADMIN) {
            return { error: 'Access denied' };
        }
        return this.payoutsService.getTeacherEarnings(id);
    }
    async getEarningsSummary(id, req) {
        const user = req.user;
        if (user.id !== id && user.role !== user_entity_1.UserRole.ORG_ADMIN) {
            return { error: 'Access denied' };
        }
        return this.payoutsService.getEarningsSummary(id);
    }
    async markEarningsPaid(id, month, year) {
        return this.payoutsService.markAsPaid(id, month, year);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('subscriptions/plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Post)('organizations/:id/subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ORG_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Patch)('organizations/:id/subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ORG_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subscription_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Get)('organizations/:id/subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Delete)('organizations/:id/subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ORG_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('organizations/:id/subscription/portal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getCustomerPortal", null);
__decorate([
    (0, common_1.Post)('webhooks/stripe'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Get)('teachers/:id/earnings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTeacherEarnings", null);
__decorate([
    (0, common_1.Get)('teachers/:id/earnings/summary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getEarningsSummary", null);
__decorate([
    (0, common_1.Patch)('teachers/:id/earnings/:month/:year/mark-paid'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ORG_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('month')),
    __param(2, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "markEarningsPaid", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [subscription_tiers_service_1.SubscriptionTiersService,
        organization_subscription_service_1.OrganizationSubscriptionsService,
        teacher_payouts_service_1.TeacherPayoutsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map