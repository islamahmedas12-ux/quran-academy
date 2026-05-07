export declare enum SubscriptionTierType {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    INSTITUTION = "institution"
}
export declare class SubscriptionTier {
    id: string;
    name: string;
    tier: SubscriptionTierType;
    priceMonthly: number;
    priceYearly: number;
    features: Record<string, any>;
    maxStudents: number;
    maxTeachers: number;
    maxCourses: number;
    maxLiveClassesPerMonth: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
