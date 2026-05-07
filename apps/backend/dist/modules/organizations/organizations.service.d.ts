import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
export declare class OrganizationsService {
    private readonly orgRepository;
    constructor(orgRepository: Repository<Organization>);
    findOne(id: string): Promise<Organization | null>;
    findBySlug(slug: string): Promise<Organization | null>;
    create(data: Partial<Organization>): Promise<Organization>;
    update(id: string, data: Partial<Organization>): Promise<Organization>;
    updateStripeCustomerId(id: string, customerId: string): Promise<void>;
}
