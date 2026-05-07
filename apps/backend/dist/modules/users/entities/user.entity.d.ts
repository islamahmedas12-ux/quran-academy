import { Organization } from '../../organizations/entities/organization.entity';
export declare enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ORG_ADMIN = "org_admin",
    SUPER_ADMIN = "super_admin"
}
export declare class User {
    id: string;
    email: string;
    fullName: string;
    organizationId: string;
    organization: Organization;
    role: UserRole;
    isActive: boolean;
    avatar: string;
    phone: string;
    dateOfBirth: Date;
    createdAt: Date;
    updatedAt: Date;
}
