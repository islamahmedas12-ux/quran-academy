import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from '../constants/enums';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const TenantHeader = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantSlug = request.headers['x-tenant-slug'];
    return data ? tenantSlug?.[data] : tenantSlug;
  },
);

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

export const Pagination = createParamDecorator(
  (data: { defaultLimit?: number; maxLimit?: number }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(
      data.maxLimit || 100,
      Math.max(1, parseInt(query.limit, 10) || data.defaultLimit || 20),
    );
    return { page, limit, offset: (page - 1) * limit };
  },
);
