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
var EnrollmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const lesson_progress_entity_1 = require("../entities/lesson-progress.entity");
const course_entity_1 = require("../entities/course.entity");
const users_service_1 = require("../../users/users.service");
const organizations_service_1 = require("../../organizations/organizations.service");
let EnrollmentsService = EnrollmentsService_1 = class EnrollmentsService {
    enrollmentRepository;
    lessonProgressRepository;
    courseRepository;
    usersService;
    organizationsService;
    logger = new common_1.Logger(EnrollmentsService_1.name);
    constructor(enrollmentRepository, lessonProgressRepository, courseRepository, usersService, organizationsService) {
        this.enrollmentRepository = enrollmentRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.courseRepository = courseRepository;
        this.usersService = usersService;
        this.organizationsService = organizationsService;
    }
    async enroll(studentId, courseId) {
        const student = await this.usersService.findById(studentId);
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ['lessons'],
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const existing = await this.enrollmentRepository.findOne({
            where: { studentId, courseId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already enrolled in this course');
        }
        const enrollment = this.enrollmentRepository.create({
            studentId,
            courseId,
        });
        return this.enrollmentRepository.save(enrollment);
    }
    async findMyEnrollments(studentId) {
        return this.enrollmentRepository.find({
            where: { studentId },
            relations: ['course', 'course.instructor'],
            order: { enrolledAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: ['course', 'course.lessons', 'lessonProgress', 'student'],
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.studentId !== userId) {
            const user = await this.usersService.findById(userId);
            if (!user || (user.role !== 'org_admin' && user.id !== enrollment.course.instructorId)) {
                throw new common_1.ForbiddenException('You do not have access to this enrollment');
            }
        }
        return enrollment;
    }
    async unenroll(id, userId) {
        const enrollment = await this.findOne(id, userId);
        if (enrollment.studentId !== userId) {
            const user = await this.usersService.findById(userId);
            if (!user || user.role !== 'org_admin') {
                throw new common_1.ForbiddenException('You can only unenroll yourself');
            }
        }
        await this.enrollmentRepository.remove(enrollment);
    }
    async updateProgress(enrollmentId, userId, dto) {
        const enrollment = await this.findOne(enrollmentId, userId);
        let progress = await this.lessonProgressRepository.findOne({
            where: { enrollmentId, lessonId: dto.lessonId },
        });
        if (!progress) {
            progress = this.lessonProgressRepository.create({
                enrollmentId,
                lessonId: dto.lessonId,
            });
        }
        if (dto.watchedDuration !== undefined) {
            progress.watchedDuration = dto.watchedDuration;
        }
        if (dto.isCompleted) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
        }
        await this.lessonProgressRepository.save(progress);
        await this.updateEnrollmentProgress(enrollment);
        return progress;
    }
    async getProgress(enrollmentId, userId) {
        await this.findOne(enrollmentId, userId);
        return this.lessonProgressRepository.find({
            where: { enrollmentId },
            relations: ['lesson'],
        });
    }
    async updateEnrollmentProgress(enrollment) {
        const course = await this.courseRepository.findOne({
            where: { id: enrollment.courseId },
            relations: ['lessons'],
        });
        if (!course || !course.lessons.length)
            return;
        const completedCount = await this.lessonProgressRepository.count({
            where: { enrollmentId: enrollment.id, isCompleted: true },
        });
        const totalLessons = course.lessons.length;
        enrollment.progress = Math.round((completedCount / totalLessons) * 100);
        if (enrollment.progress >= 100) {
            enrollment.completedAt = new Date();
        }
        await this.enrollmentRepository.save(enrollment);
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = EnrollmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __param(1, (0, typeorm_1.InjectRepository)(lesson_progress_entity_1.LessonProgress)),
    __param(2, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        organizations_service_1.OrganizationsService])
], EnrollmentsService);
//# sourceMappingURL=enrollment.service.js.map