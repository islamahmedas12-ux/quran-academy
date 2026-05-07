import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionTier, SubscriptionTierType } from '../entities/subscription-tier.entity';

@Injectable()
export class SubscriptionTiersService {
  private readonly logger = new Logger(SubscriptionTiersService.name);

  constructor(
    @InjectRepository(SubscriptionTier)
    private readonly tierRepository: Repository<SubscriptionTier>,
  ) {}

  async findAll(): Promise<SubscriptionTier[]> {
    return this.tierRepository.find({
      where: { isActive: true },
      order: { priceMonthly: 'ASC' },
    });
  }

  async findOne(tierType: SubscriptionTierType): Promise<SubscriptionTier> {
    const tier = await this.tierRepository.findOne({
      where: { tier: tierType, isActive: true },
    });
    if (!tier) {
      throw new NotFoundException(`Subscription tier ${tierType} not found`);
    }
    return tier;
  }

  async seedDefaultTiers(): Promise<void> {
    const defaultTiers = [
      {
        name: 'Free',
        tier: SubscriptionTierType.FREE,
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
        tier: SubscriptionTierType.BASIC,
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
        tier: SubscriptionTierType.PREMIUM,
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
        tier: SubscriptionTierType.INSTITUTION,
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
}
