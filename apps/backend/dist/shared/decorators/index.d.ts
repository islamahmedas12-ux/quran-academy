import { Role } from '../constants/enums';
import { SubscriptionTierType } from '../../modules/payments/entities/subscription-tier.entity';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const PLAN_GUARD_KEY = "plan_guard";
export declare const PlanGuard: (requiredTier: SubscriptionTierType) => import("@nestjs/common").CustomDecorator<string>;
export declare const TenantHeader: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
export declare const CurrentUser: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
export declare const Pagination: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | {
    defaultLimit?: number;
    maxLimit?: number;
})[]) => ParameterDecorator;
