import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

interface TenantRequest extends Request {
  organization?: { id: string; schemaName: string };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const slug = req.headers['x-tenant-slug'] as string;

    if (slug) {
      const organization = await this.tenantService.resolveOrganization(slug);
      req.organization = organization;
    }

    next();
  }
}
