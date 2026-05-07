"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quran_controller_1 = require("./quran.controller");
const quran_service_1 = require("./quran.service");
const reading_progress_service_1 = require("./reading-progress.service");
const student_progress_entity_1 = require("./entities/student-progress.entity");
const redis_service_1 = require("../../shared/services/redis.service");
let QuranModule = class QuranModule {
};
exports.QuranModule = QuranModule;
exports.QuranModule = QuranModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([student_progress_entity_1.StudentProgress])],
        controllers: [quran_controller_1.QuranController],
        providers: [quran_service_1.QuranService, reading_progress_service_1.ReadingProgressService, redis_service_1.RedisService],
        exports: [quran_service_1.QuranService, reading_progress_service_1.ReadingProgressService],
    })
], QuranModule);
//# sourceMappingURL=quran.module.js.map