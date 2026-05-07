import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionTierType } from '../../modules/payments/entities/subscription-tier.entity';

export const PLAN_GUARD_KEY = 'plan_guard';

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

    const subscriptionRepo = request.entityManager?.getRepository('OrganizationSubscription');
    if (!subscriptionRepo) {
      return true;
    }

    const subscription = await subscriptionRepo.findOne({
      where: { organizationId: user.organizationId },
    });

    if (!subscription) {
      throw new ForbiddenException('Subscription not found');
    }

    const userTierIndex = this.tierOrder.indexOf(subscription.tierType);
    const requiredTierIndex = this.tierOrder.indexOf(requiredTier);

    if (userTierIndex < requiredTierIndex) {
      throw new ForbiddenException(`This feature requires ${requiredTier} plan or higher`);
    }

    return true;
  }
}
