import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class TenantService implements OnModuleInit {
  private readonly logger = new Logger(TenantService.name);
  private currentSchema: string | null = null;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.logger.log('TenantService initialized');
  }

  async switchSchema(slug: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { slug },
    });

    if (!organization) {
      throw new Error(`Organization with slug ${slug} not found`);
    }

    this.currentSchema = organization.schemaName;
    await this.dataSource.query(`SET search_path TO $1`, [this.currentSchema]);
    this.logger.debug(`Switched to schema: ${this.currentSchema}`);
  }

  async createSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS $1`, [schemaName]);
    this.logger.log(`Created schema: ${schemaName}`);
  }

  async initializeSchema(schemaName: string): Promise<void> {
    await this.createSchema(schemaName);
    await this.dataSource.query(`SET search_path TO $1`, [schemaName]);
  }

  getCurrentSchema(): string | null {
    return this.currentSchema;
  }

  async resolveOrganization(slug: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { slug },
    });

    if (!organization) {
      throw new Error(`Organization with slug ${slug} not found`);
    }

    return organization;
  }
}
