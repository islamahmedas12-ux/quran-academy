import { Request } from 'express';
import { Role } from '../constants/enums';
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}
export interface JwtPayload {
    userId: string;
    organizationId: string;
    role: Role;
    email: string;
}
export interface TenantContext {
    organizationId: string;
    schemaName: string;
    role: Role;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface MagicLinkToken {
    email: string;
    organizationId?: string;
    role?: Role;
    expiresAt: Date;
}
export interface RefreshTokenData {
    userId: string;
    tokenVersion: number;
}
