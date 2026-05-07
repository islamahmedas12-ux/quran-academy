export declare enum Role {
    SUPER_ADMIN = "super_admin",
    ORG_ADMIN = "org_admin",
    TEACHER = "teacher",
    STUDENT = "student",
    PARENT = "parent",
    PARENT_STUDENT = "parent_student"
}
export declare enum SubscriptionTier {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    INSTITUTION = "institution"
}
export declare enum ClassStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum EnrollmentStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare const PUBLIC_ROUTES: string[];
