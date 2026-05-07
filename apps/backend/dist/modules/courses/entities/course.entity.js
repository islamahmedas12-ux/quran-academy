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
exports.Course = exports.CourseCategory = exports.CourseDifficulty = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const lesson_entity_1 = require("./lesson.entity");
const enrollment_entity_1 = require("./enrollment.entity");
var CourseDifficulty;
(function (CourseDifficulty) {
    CourseDifficulty["BEGINNER"] = "beginner";
    CourseDifficulty["INTERMEDIATE"] = "intermediate";
    CourseDifficulty["ADVANCED"] = "advanced";
})(CourseDifficulty || (exports.CourseDifficulty = CourseDifficulty = {}));
var CourseCategory;
(function (CourseCategory) {
    CourseCategory["TAJWEED"] = "tajweed";
    CourseCategory["QIRAAT"] = "qiraat";
    CourseCategory["TAFSIR"] = "tafsir";
    CourseCategory["HIFZ"] = "hifz";
    CourseCategory["ARABIC"] = "arabic";
    CourseCategory["ISLAMIC_STUDIES"] = "islamic_studies";
    CourseCategory["OTHER"] = "other";
})(CourseCategory || (exports.CourseCategory = CourseCategory = {}));
let Course = class Course {
    id;
    organizationId;
    organization;
    title;
    description;
    thumbnailUrl;
    category;
    language;
    difficulty;
    duration;
    instructorId;
    instructor;
    prerequisites;
    isPublished;
    isDeleted;
    createdAt;
    updatedAt;
    lessons;
    enrollments;
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id' }),
    __metadata("design:type", String)
], Course.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], Course.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url', nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CourseCategory, default: CourseCategory.OTHER }),
    __metadata("design:type", String)
], Course.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ar' }),
    __metadata("design:type", String)
], Course.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CourseDifficulty, default: CourseDifficulty.BEGINNER }),
    __metadata("design:type", String)
], Course.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'instructor_id' }),
    __metadata("design:type", String)
], Course.prototype, "instructorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'instructor_id' }),
    __metadata("design:type", user_entity_1.User)
], Course.prototype, "instructor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Course.prototype, "prerequisites", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_published', default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_deleted', default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Course.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Course.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lesson_entity_1.Lesson, (lesson) => lesson.course),
    __metadata("design:type", Array)
], Course.prototype, "lessons", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => enrollment_entity_1.Enrollment, (enrollment) => enrollment.course),
    __metadata("design:type", Array)
], Course.prototype, "enrollments", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses')
], Course);
//# sourceMappingURL=course.entity.js.map