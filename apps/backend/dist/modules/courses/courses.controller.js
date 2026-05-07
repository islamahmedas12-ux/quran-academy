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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const course_service_1 = require("./services/course.service");
const lesson_service_1 = require("./services/lesson.service");
const enrollment_service_1 = require("./services/enrollment.service");
const certificate_service_1 = require("./services/certificate.service");
const course_dto_1 = require("./dto/course.dto");
const lesson_dto_1 = require("./dto/lesson.dto");
const enrollment_dto_1 = require("./dto/enrollment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CoursesController = class CoursesController {
    coursesService;
    lessonsService;
    enrollmentsService;
    certificateService;
    constructor(coursesService, lessonsService, enrollmentsService, certificateService) {
        this.coursesService = coursesService;
        this.lessonsService = lessonsService;
        this.enrollmentsService = enrollmentsService;
        this.certificateService = certificateService;
    }
    async listCourses(query) {
        return this.coursesService.findAll(query);
    }
    async getCourse(id) {
        return this.coursesService.findOne(id);
    }
    async createCourse(dto, req) {
        return this.coursesService.create(req.user.id, dto);
    }
    async updateCourse(id, dto, req) {
        return this.coursesService.update(id, req.user.id, dto);
    }
    async deleteCourse(id, req) {
        await this.coursesService.delete(id, req.user.id);
        return { success: true };
    }
    async publishCourse(id, req) {
        return this.coursesService.publish(id, req.user.id);
    }
    async listLessons(courseId) {
        return this.lessonsService.findByCourse(courseId);
    }
    async getLesson(id) {
        return this.lessonsService.findOne(id);
    }
    async getLessonVideo(id, req) {
        const url = await this.lessonsService.getSignedVideoUrl(id, req.user.id);
        return { videoUrl: url };
    }
    async createLesson(dto, req) {
        return this.lessonsService.create(dto.courseId, dto);
    }
    async updateLesson(id, dto, req) {
        return this.lessonsService.update(id, req.user.id, dto);
    }
    async reorderLesson(id, dto, req) {
        return this.lessonsService.reorderLesson(id, dto.order);
    }
    async deleteLesson(id, req) {
        await this.lessonsService.delete(id, req.user.id);
        return { success: true };
    }
    async getUploadUrl(id, req) {
        return this.lessonsService.getUploadUrl(id, req.user.id);
    }
    async enroll(body, req) {
        return this.enrollmentsService.enroll(req.user.id, body.courseId);
    }
    async myEnrollments(req) {
        return this.enrollmentsService.findMyEnrollments(req.user.id);
    }
    async getEnrollment(id, req) {
        return this.enrollmentsService.findOne(id, req.user.id);
    }
    async unenroll(id, req) {
        await this.enrollmentsService.unenroll(id, req.user.id);
        return { success: true };
    }
    async updateProgress(id, dto, req) {
        return this.enrollmentsService.updateProgress(id, req.user.id, dto);
    }
    async getProgress(id, req) {
        return this.enrollmentsService.getProgress(id, req.user.id);
    }
    async generateCertificate(id, req) {
        return this.certificateService.generate(id, req.user.id);
    }
    async getCertificate(id, req) {
        const url = await this.certificateService.getCertificate(id, req.user.id);
        return { certificateUrl: url };
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)('courses'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_dto_1.CourseQueryDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listCourses", null);
__decorate([
    (0, common_1.Get)('courses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourse", null);
__decorate([
    (0, common_1.Post)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_dto_1.CreateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Patch)('courses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_dto_1.UpdateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)('courses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Post)('courses/:id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "publishCourse", null);
__decorate([
    (0, common_1.Get)('courses/:courseId/lessons'),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listLessons", null);
__decorate([
    (0, common_1.Get)('lessons/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getLesson", null);
__decorate([
    (0, common_1.Get)('lessons/:id/video'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getLessonVideo", null);
__decorate([
    (0, common_1.Post)('lessons'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Patch)('lessons/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lesson_dto_1.UpdateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Patch)('lessons/:id/order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lesson_dto_1.LessonOrderDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "reorderLesson", null);
__decorate([
    (0, common_1.Delete)('lessons/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Post)('lessons/:id/upload-url'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getUploadUrl", null);
__decorate([
    (0, common_1.Post)('enrollments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('enrollments/my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "myEnrollments", null);
__decorate([
    (0, common_1.Get)('enrollments/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getEnrollment", null);
__decorate([
    (0, common_1.Delete)('enrollments/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "unenroll", null);
__decorate([
    (0, common_1.Post)('enrollments/:id/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enrollment_dto_1.UpdateProgressDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Get)('enrollments/:id/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Post)('enrollments/:id/certificate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "generateCertificate", null);
__decorate([
    (0, common_1.Get)('certificates/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCertificate", null);
exports.CoursesController = CoursesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [course_service_1.CoursesService,
        lesson_service_1.LessonsService,
        enrollment_service_1.EnrollmentsService,
        certificate_service_1.CertificateService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map