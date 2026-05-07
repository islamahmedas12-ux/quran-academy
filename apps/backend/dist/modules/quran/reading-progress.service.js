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
var ReadingProgressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingProgressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_progress_entity_1 = require("./entities/student-progress.entity");
const redis_service_1 = require("../../shared/services/redis.service");
const PROGRESS_CACHE_TTL = 60 * 30;
let ReadingProgressService = ReadingProgressService_1 = class ReadingProgressService {
    progressRepository;
    redisService;
    logger = new common_1.Logger(ReadingProgressService_1.name);
    constructor(progressRepository, redisService) {
        this.progressRepository = progressRepository;
        this.redisService = redisService;
    }
    async saveProgress(studentId, dto) {
        const cacheKey = `quran:progress:${studentId}:${dto.surah}`;
        let progress = await this.progressRepository.findOne({
            where: { studentId, surah: dto.surah },
        });
        if (progress) {
            progress.ayah = dto.ayah;
            progress.timeSpent += dto.timeSpent;
        }
        else {
            progress = this.progressRepository.create({
                studentId,
                surah: dto.surah,
                ayah: dto.ayah,
                timeSpent: dto.timeSpent,
            });
        }
        await this.progressRepository.save(progress);
        await this.redisService.del(cacheKey);
    }
    async getProgress(studentId, page = 1, limit = 50) {
        const cacheKey = `quran:progress:${studentId}:page:${page}:limit:${limit}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        const [progress, total] = await this.progressRepository.findAndCount({
            where: { studentId },
            order: { updatedAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        await this.redisService.set(cacheKey, progress, PROGRESS_CACHE_TTL);
        return progress;
    }
    async getLastReadPosition(studentId, surah) {
        const cacheKey = `quran:progress:${studentId}:${surah}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        const progress = await this.progressRepository.findOne({
            where: { studentId, surah },
            order: { updatedAt: 'DESC' },
        });
        if (progress) {
            await this.redisService.set(cacheKey, progress, PROGRESS_CACHE_TTL);
        }
        return progress;
    }
    async getProgressSummary(studentId) {
        const results = await this.progressRepository
            .createQueryBuilder('progress')
            .select('progress.surah', 'surah')
            .addSelect('progress.ayah', 'ayah')
            .addSelect('MAX(progress.updatedAt)', 'lastReadAt')
            .where('progress.studentId = :studentId', { studentId })
            .groupBy('progress.surah')
            .addGroupBy('progress.ayah')
            .getRawMany();
        return results.map((r) => ({
            surah: r.surah,
            ayah: r.ayah,
            lastReadAt: new Date(r.lastReadAt),
        }));
    }
};
exports.ReadingProgressService = ReadingProgressService;
exports.ReadingProgressService = ReadingProgressService = ReadingProgressService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_progress_entity_1.StudentProgress)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService])
], ReadingProgressService);
//# sourceMappingURL=reading-progress.service.js.map