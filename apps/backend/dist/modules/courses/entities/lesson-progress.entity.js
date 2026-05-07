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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonProgress = void 0;
const typeorm_1 = require("typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const lesson_entity_1 = require("./lesson.entity");
let LessonProgress = class LessonProgress {
    id;
    enrollmentId;
    enrollment;
    lessonId;
    lesson;
    watchedDuration;
    isCompleted;
    completedAt;
    createdAt;
};
exports.LessonProgress = LessonProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LessonProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enrollment_id' }),
    __metadata("design:type", String)
], LessonProgress.prototype, "enrollmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => enrollment_entity_1.Enrollment, (enrollment) => enrollment.lessonProgress),
    (0, typeorm_1.JoinColumn)({ name: 'enrollment_id' }),
    __metadata("design:type", enrollment_entity_1.Enrollment)
], LessonProgress.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lesson_id' }),
    __metadata("design:type", String)
], LessonProgress.prototype, "lessonId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lesson_entity_1.Lesson),
    (0, typeorm_1.JoinColumn)({ name: 'lesson_id' }),
    __metadata("design:type", lesson_entity_1.Lesson)
], LessonProgress.prototype, "lesson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'watched_duration', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], LessonProgress.prototype, "watchedDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_completed', default: false }),
    __metadata("design:type", Boolean)
], LessonProgress.prototype, "isCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], LessonProgress.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LessonProgress.prototype, "createdAt", void 0);
exports.LessonProgress = LessonProgress = __decorate([
    (0, typeorm_1.Entity)('lesson_progress')
], LessonProgress);
//# sourceMappingURL=lesson-progress.entity.js.map