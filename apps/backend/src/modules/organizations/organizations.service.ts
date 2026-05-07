import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
  ) {}

  async findOne(id: string): Promise<Organization | null> {
    return this.orgRepository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.orgRepository.findOne({ where: { slug } });
  }

  async create(data: Partial<Organization>): Promise<Organization> {
    const org = this.orgRepository.create(data);
    return this.orgRepository.save(org);
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    const org = await this.findOne(id);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    Object.assign(org, data);
    return this.orgRepository.save(org);
  }

  async updateStripeCustomerId(id: string, customerId: string): Promise<void> {
    await this.orgRepository.update(id, { stripeCustomerId: customerId });
  }
}
