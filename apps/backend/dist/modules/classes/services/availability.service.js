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
var AvailabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const availability_slot_entity_1 = require("../entities/availability-slot.entity");
let AvailabilityService = AvailabilityService_1 = class AvailabilityService {
    availabilityRepo;
    logger = new common_1.Logger(AvailabilityService_1.name);
    constructor(availabilityRepo) {
        this.availabilityRepo = availabilityRepo;
    }
    async getTeacherAvailability(teacherId, fromDate, toDate) {
        const query = this.availabilityRepo
            .createQueryBuilder('slot')
            .where('slot.teacherId = :teacherId', { teacherId })
            .andWhere('slot.isActive = :isActive', { isActive: true });
        if (fromDate) {
            query.andWhere('slot.specificDate >= :fromDate', { fromDate });
        }
        if (toDate) {
            query.andWhere('slot.specificDate <= :toDate', { toDate });
        }
        if (!fromDate && !toDate) {
            query.andWhere('(slot.isRecurring = true OR slot.specificDate >= CURRENT_DATE)');
        }
        query.orderBy('slot.dayOfWeek', 'ASC').addOrderBy('slot.startTime', 'ASC');
        return query.getMany();
    }
    async upsertAvailability(teacherId, dto) {
        const existing = await this.availabilityRepo.findOne({
            where: {
                teacherId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                isRecurring: dto.isRecurring !== false,
                specificDate: dto.specificDate ? new Date(dto.specificDate) : (0, typeorm_2.IsNull)(),
            },
        });
        if (existing) {
            Object.assign(existing, dto);
            return this.availabilityRepo.save(existing);
        }
        const slot = this.availabilityRepo.create({
            teacherId,
            ...dto,
        });
        return this.availabilityRepo.save(slot);
    }
    async updateAvailability(teacherId, slotId, dto) {
        const slot = await this.availabilityRepo.findOne({
            where: { id: slotId, teacherId },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Availability slot not found');
        }
        Object.assign(slot, dto);
        return this.availabilityRepo.save(slot);
    }
    async deleteAvailability(teacherId, slotId) {
        const result = await this.availabilityRepo.delete({ id: slotId, teacherId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Availability slot not found');
        }
    }
    async checkSlotAvailable(teacherId, startTime, endTime) {
        const dayOfWeek = startTime.getDay();
        const timeStr = startTime.toISOString().split('T')[1].slice(0, 8);
        const slot = await this.availabilityRepo
            .createQueryBuilder('slot')
            .where('slot.teacherId = :teacherId', { teacherId })
            .andWhere('slot.isActive = :isActive', { isActive: true })
            .andWhere('(slot.isRecurring = true AND slot.dayOfWeek = :dayOfWeek) OR (slot.specificDate = :specificDate)')
            .setParameters({
            teacherId,
            dayOfWeek,
            specificDate: startTime.toISOString().split('T')[0],
        })
            .getOne();
        if (!slot)
            return false;
        return timeStr >= slot.startTime && timeStr <= slot.endTime;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = AvailabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(availability_slot_entity_1.AvailabilitySlot)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map