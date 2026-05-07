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
var SubscriptionTiersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTiersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_tier_entity_1 = require("../entities/subscription-tier.entity");
let SubscriptionTiersService = SubscriptionTiersService_1 = class SubscriptionTiersService {
    tierRepository;
    logger = new common_1.Logger(SubscriptionTiersService_1.name);
    constructor(tierRepository) {
        this.tierRepository = tierRepository;
    }
    async findAll() {
        return this.tierRepository.find({
            where: { isActive: true },
            order: { priceMonthly: 'ASC' },
        });
    }
    async findOne(tierType) {
        const tier = await this.tierRepository.findOne({
            where: { tier: tierType, isActive: true },
        });
        if (!tier) {
            throw new common_1.NotFoundException(`Subscription tier ${tierType} not found`);
        }
        return tier;
    }
    async seedDefaultTiers() {
        const defaultTiers = [
            {
                name: 'Free',
                tier: subscription_tier_entity_1.SubscriptionTierType.FREE,
                priceMonthly: 0,
                priceYearly: 0,
                features: {
                    courses: true,
                    liveClasses: false,
                    certificates: false,
                    quranReading: true,
                },
                maxStudents: 3,
                maxTeachers: 1,
                maxCourses: 3,
                maxLiveClassesPerMonth: 0,
            },
            {
                name: 'Basic',
                tier: subscription_tier_entity_1.SubscriptionTierType.BASIC,
                priceMonthly: 99,
                priceYearly: 990,
                features: {
                    courses: true,
                    liveClasses: true,
                    certificates: true,
                    quranReading: true,
                },
                maxStudents: 15,
                maxTeachers: 3,
                maxCourses: 10,
                maxLiveClassesPerMonth: 4,
            },
            {
                name: 'Premium',
                tier: subscription_tier_entity_1.SubscriptionTierType.PREMIUM,
                priceMonthly: 299,
                priceYearly: 2990,
                features: {
                    courses: true,
                    liveClasses: true,
                    certificates: true,
                    quranReading: true,
                    prioritySupport: true,
                },
                maxStudents: 50,
                maxTeachers: 10,
                maxCourses: -1,
                maxLiveClassesPerMonth: -1,
            },
            {
                name: 'Institution',
                tier: subscription_tier_entity_1.SubscriptionTierType.INSTITUTION,
                priceMonthly: 999,
                priceYearly: 9990,
                features: {
                    courses: true,
                    liveClasses: true,
                    certificates: true,
                    quranReading: true,
                    prioritySupport: true,
                    customBranding: true,
                    apiAccess: true,
                },
                maxStudents: -1,
                maxTeachers: -1,
                maxCourses: -1,
                maxLiveClassesPerMonth: -1,
            },
        ];
        for (const tierData of defaultTiers) {
            const existing = await this.tierRepository.findOne({
                where: { tier: tierData.tier },
            });
            if (!existing) {
                const tier = this.tierRepository.create(tierData);
                await this.tierRepository.save(tier);
                this.logger.log(`Created subscription tier: ${tierData.name}`);
            }
        }
    }
};
exports.SubscriptionTiersService = SubscriptionTiersService;
exports.SubscriptionTiersService = SubscriptionTiersService = SubscriptionTiersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_tier_entity_1.SubscriptionTier)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionTiersService);
//# sourceMappingURL=subscription-tiers.service.js.map