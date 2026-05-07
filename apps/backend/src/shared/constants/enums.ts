export enum Role {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  PARENT_STUDENT = 'parent_student',
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  INSTITUTION = 'institution',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const PUBLIC_ROUTES = [
  '/auth/magic-link',
  '/auth/verify',
  '/health',
  '/organizations/onboard',
];
