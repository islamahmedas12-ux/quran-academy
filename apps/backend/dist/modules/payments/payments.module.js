"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payments_controller_1 = require("./payments.controller");
const entities_1 = require("./entities");
const services_1 = require("./services");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const organizations_module_1 = require("../organizations/organizations.module");
const plan_guard_decorator_1 = require("../../shared/decorators/plan-guard.decorator");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.SubscriptionTier,
                entities_1.OrganizationSubscription,
                entities_1.TeacherEarning,
                entities_1.PaymentTransaction,
            ]),
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => organizations_module_1.OrganizationsModule),
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [
            services_1.StripeService,
            services_1.SubscriptionTiersService,
            services_1.OrganizationSubscriptionsService,
            services_1.TeacherPayoutsService,
            plan_guard_decorator_1.PlanGuardService,
        ],
        exports: [
            services_1.StripeService,
            services_1.SubscriptionTiersService,
            services_1.OrganizationSubscriptionsService,
            services_1.TeacherPayoutsService,
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map