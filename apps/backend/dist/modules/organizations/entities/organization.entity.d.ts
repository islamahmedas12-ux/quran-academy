export declare enum BillingCycle {
    MONTHLY = "monthly",
    YEARLY = "yearly"
}
export declare class Organization {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    logoUrl: string;
    stripeCustomerId: string;
    billingCycle: BillingCycle;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
