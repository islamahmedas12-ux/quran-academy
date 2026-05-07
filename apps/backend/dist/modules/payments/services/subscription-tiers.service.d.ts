import { Repository } from 'typeorm';
import { SubscriptionTier, SubscriptionTierType } from '../entities/subscription-tier.entity';
export declare class SubscriptionTiersService {
    private readonly tierRepository;
    private readonly logger;
    constructor(tierRepository: Repository<SubscriptionTier>);
    findAll(): Promise<SubscriptionTier[]>;
    findOne(tierType: SubscriptionTierType): Promise<SubscriptionTier>;
    seedDefaultTiers(): Promise<void>;
}
