import { OnModuleInit } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Organization } from './entities/organization.entity';
export declare class TenantService implements OnModuleInit {
    private readonly organizationRepository;
    private readonly dataSource;
    private readonly logger;
    private currentSchema;
    constructor(organizationRepository: Repository<Organization>, dataSource: DataSource);
    onModuleInit(): void;
    switchSchema(slug: string): Promise<void>;
    createSchema(schemaName: string): Promise<void>;
    initializeSchema(schemaName: string): Promise<void>;
    getCurrentSchema(): string | null;
}
