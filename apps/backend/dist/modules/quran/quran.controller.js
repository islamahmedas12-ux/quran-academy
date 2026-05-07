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
exports.QuranController = void 0;
const common_1 = require("@nestjs/common");
const quran_service_1 = require("./quran.service");
const reading_progress_service_1 = require("./reading-progress.service");
const quran_dto_1 = require("./dto/quran.dto");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
let QuranController = class QuranController {
    quranService;
    readingProgressService;
    constructor(quranService, readingProgressService) {
        this.quranService = quranService;
        this.readingProgressService = readingProgressService;
    }
    async getSurahs() {
        return this.quranService.getSurahs();
    }
    async getVerse(params) {
        return this.quranService.getVerse(params.surah, params.ayah);
    }
    async getSurah(params, query) {
        return this.quranService.getSurah(params.surah, query.page ?? 1, query.limit ?? 50);
    }
    async getSurahAudio(params, query) {
        const audioUrl = await this.quranService.getSurahAudio(params.surah, query.reciter ?? 'Alafasy', query.quality ?? '128kbps');
        return { audioUrl };
    }
    async getVerseAudio(params) {
        const audioUrl = this.quranService.buildAudioUrl(params.surah, params.ayah);
        return { audioUrl };
    }
    async saveProgress(body, req) {
        await this.readingProgressService.saveProgress(req.user.userId, body);
        return { success: true };
    }
    async getProgress(studentId, query) {
        const progress = await this.readingProgressService.getProgress(studentId, query.page ?? 1, query.limit ?? 50);
        return { progress };
    }
};
exports.QuranController = QuranController;
__decorate([
    (0, common_1.Get)('surahs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "getSurahs", null);
__decorate([
    (0, common_1.Get)('verse/:surah/:ayah'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quran_dto_1.VerseParamsDto]),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "getVerse", null);
__decorate([
    (0, common_1.Get)('surah/:surah'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quran_dto_1.SurahParamsDto,
        quran_dto_1.SurahQueryDto]),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "getSurah", null);
__decorate([
    (0, common_1.Get)('surah/:surah/audio'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quran_dto_1.SurahParamsDto,
        quran_dto_1.AudioQueryDto]),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "getSurahAudio", null);
__decorate([
    (0, common_1.Get)('surah/:surah/:ayah/audio'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quran_dto_1.VerseParamsDto]),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "getVerseAudio", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('progress'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quran_dto_1.ReadingProgressDto, Object]),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "saveProgress", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('progress/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quran_dto_1.ReadingProgressQueryDto]),
    __metadata("design:returntype", Promise)
], QuranController.prototype, "getProgress", null);
exports.QuranController = QuranController = __decorate([
    (0, common_1.Controller)('quran'),
    __metadata("design:paramtypes", [quran_service_1.QuranService,
        reading_progress_service_1.ReadingProgressService])
], QuranController);
//# sourceMappingURL=quran.controller.js.map