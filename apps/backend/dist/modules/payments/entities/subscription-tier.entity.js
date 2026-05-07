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
exports.SubscriptionTier = exports.SubscriptionTierType = void 0;
const typeorm_1 = require("typeorm");
var SubscriptionTierType;
(function (SubscriptionTierType) {
    SubscriptionTierType["FREE"] = "free";
    SubscriptionTierType["BASIC"] = "basic";
    SubscriptionTierType["PREMIUM"] = "premium";
    SubscriptionTierType["INSTITUTION"] = "institution";
})(SubscriptionTierType || (exports.SubscriptionTierType = SubscriptionTierType = {}));
let SubscriptionTier = class SubscriptionTier {
    id;
    name;
    tier;
    priceMonthly;
    priceYearly;
    features;
    maxStudents;
    maxTeachers;
    maxCourses;
    maxLiveClassesPerMonth;
    isActive;
    createdAt;
    updatedAt;
};
exports.SubscriptionTier = SubscriptionTier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubscriptionTier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubscriptionTier.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubscriptionTierType, unique: true }),
    __metadata("design:type", String)
], SubscriptionTier.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SubscriptionTier.prototype, "priceMonthly", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SubscriptionTier.prototype, "priceYearly", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], SubscriptionTier.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_students', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], SubscriptionTier.prototype, "maxStudents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_teachers', type: 'int', default: 2 }),
    __metadata("design:type", Number)
], SubscriptionTier.prototype, "maxTeachers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_courses', type: 'int', default: 3 }),
    __metadata("design:type", Number)
], SubscriptionTier.prototype, "maxCourses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_live_classes_per_month', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SubscriptionTier.prototype, "maxLiveClassesPerMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SubscriptionTier.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SubscriptionTier.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SubscriptionTier.prototype, "updatedAt", void 0);
exports.SubscriptionTier = SubscriptionTier = __decorate([
    (0, typeorm_1.Entity)('subscription_tiers')
], SubscriptionTier);
//# sourceMappingURL=subscription-tier.entity.js.map