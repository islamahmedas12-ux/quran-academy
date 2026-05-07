import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SubscriptionTierType } from '../entities/subscription-tier.entity';

export class CreateSubscriptionDto {
  @IsString()
  organizationId: string;

  @IsEnum(SubscriptionTierType)
  tierType: SubscriptionTierType;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionTierType)
  tierType: SubscriptionTierType;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
