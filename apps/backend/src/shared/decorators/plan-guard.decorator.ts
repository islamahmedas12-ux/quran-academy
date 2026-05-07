import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionTierType } from '../../payments/entities/subscription-tier.entity';
import { OrganizationSubscriptionsService } from '../services/organization-subscription.service';
import { UsersService } from '../../users/users.service';

export const PLAN_GUARD_KEY = 'plan_guard';

export const PlanGuard = (requiredTier: SubscriptionTierType) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const context = args[0];
        const user = context.user;
        if (!user) {
          throw new ForbiddenException('Authentication required');
        }

        const subscriptionsService = args[1]?.get(OrganizationSubscriptionsService);
        if (subscriptionsService) {
          const subscription = await subscriptionsService.getOrCreateSubscription(user.organizationId);
          const tierOrder = [SubscriptionTierType.FREE, SubscriptionTierType.BASIC, SubscriptionTierType.PREMIUM, SubscriptionTierType.INSTITUTION];
          const userTierIndex = tierOrder.indexOf(subscription.tierType);
          const requiredTierIndex = tierOrder.indexOf(requiredTier);

          if (userTierIndex < requiredTierIndex) {
            throw new ForbiddenException(`This feature requires ${requiredTier} plan or higher`);
          }
        }

        return originalMethod.apply(this, args);
      };
    }
  };
};

@Injectable()
export class PlanGuardService implements CanActivate {
  private readonly tierOrder = [
    SubscriptionTierType.FREE,
    SubscriptionTierType.BASIC,
    SubscriptionTierType.PREMIUM,
    SubscriptionTierType.INSTITUTION,
  ];

  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: OrganizationSubscriptionsService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.get<SubscriptionTierType>(PLAN_GUARD_KEY, context.getHandler());
    
    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const subscription = await this.subscriptionsService.getOrCreateSubscription(user.organizationId);
    const userTierIndex = this.tierOrder.indexOf(subscription.tierType);
    const requiredTierIndex = this.tierOrder.indexOf(requiredTier);

    if (userTierIndex < requiredTierIndex) {
      throw new ForbiddenException(`This feature requires ${requiredTier} plan or higher`);
    }

    return true;
  }
}
