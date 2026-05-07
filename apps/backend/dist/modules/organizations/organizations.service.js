"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("./entities/organization.entity");
let OrganizationsService = class OrganizationsService {
    orgRepository;
    constructor(orgRepository) {
        this.orgRepository = orgRepository;
    }
    async findOne(id) {
        return this.orgRepository.findOne({ where: { id } });
    }
    async findBySlug(slug) {
        return this.orgRepository.findOne({ where: { slug } });
    }
    async create(data) {
        const org = this.orgRepository.create(data);
        return this.orgRepository.save(org);
    }
    async update(id, data) {
        const org = await this.findOne(id);
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        Object.assign(org, data);
        return this.orgRepository.save(org);
    }
    async updateStripeCustomerId(id, customerId) {
        await this.orgRepository.update(id, { stripeCustomerId: customerId });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map