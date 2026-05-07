import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import {
  SubscriptionTier,
  OrganizationSubscription,
  TeacherEarning,
  PaymentTransaction,
} from './entities';
import {
  StripeService,
  SubscriptionTiersService,
  OrganizationSubscriptionsService,
  TeacherPayoutsService,
} from './services';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PlanGuardService } from '../../shared/decorators/plan-guard.service';
import { RedisService } from '../../shared/services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionTier,
      OrganizationSubscription,
      TeacherEarning,
      PaymentTransaction,
    ]),
    AuthModule,
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationsModule),
  ],
  controllers: [PaymentsController],
  providers: [
    StripeService,
    SubscriptionTiersService,
    OrganizationSubscriptionsService,
    TeacherPayoutsService,
    PlanGuardService,
    RedisService,
  ],
  exports: [
    StripeService,
    SubscriptionTiersService,
    OrganizationSubscriptionsService,
    TeacherPayoutsService,
  ],
})
export class PaymentsModule {}
