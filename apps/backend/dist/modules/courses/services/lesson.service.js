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
var LessonsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lesson_entity_1 = require("../entities/lesson.entity");
const course_entity_1 = require("../entities/course.entity");
const users_service_1 = require("../../users/users.service");
const minio_service_1 = require("../../../shared/services/minio.service");
let LessonsService = LessonsService_1 = class LessonsService {
    lessonRepository;
    courseRepository;
    usersService;
    minioService;
    logger = new common_1.Logger(LessonsService_1.name);
    constructor(lessonRepository, courseRepository, usersService, minioService) {
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.usersService = usersService;
        this.minioService = minioService;
    }
    async findByCourse(courseId) {
        return this.lessonRepository.find({
            where: { courseId },
            order: { order: 'ASC' },
        });
    }
    async findOne(id) {
        const lesson = await this.lessonRepository.findOne({
            where: { id },
            relations: ['course'],
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${id} not found`);
        }
        return lesson;
    }
    async getSignedVideoUrl(id, userId) {
        const lesson = await this.findOne(id);
        if (lesson.isFree) {
            return lesson.videoUrl;
        }
        const hasAccess = await this.checkUserAccess(userId, lesson.courseId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this lesson');
        }
        if (!lesson.videoUrl) {
            throw new common_1.NotFoundException('Video not available');
        }
        return this.minioService.getPresignedDownloadUrl(lesson.videoUrl, 7200);
    }
    async create(courseId, dto) {
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (dto.order === undefined) {
            const maxOrder = await this.lessonRepository
                .createQueryBuilder('lesson')
                .where('lesson.courseId = :courseId', { courseId })
                .select('MAX(lesson.order)', 'maxOrder')
                .getRawOne();
            dto.order = (maxOrder?.maxOrder || 0) + 1;
        }
        const lesson = this.lessonRepository.create({
            ...dto,
            courseId,
        });
        return this.lessonRepository.save(lesson);
    }
    async update(id, userId, dto) {
        const lesson = await this.findOne(id);
        const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('You do not have permission to update this lesson');
        }
        Object.assign(lesson, dto);
        return this.lessonRepository.save(lesson);
    }
    async delete(id, userId) {
        const lesson = await this.findOne(id);
        const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('You do not have permission to delete this lesson');
        }
        await this.lessonRepository.remove(lesson);
        await this.reorderLessons(lesson.courseId, lesson.order);
    }
    async reorderLesson(id, newOrder) {
        const lesson = await this.findOne(id);
        const oldOrder = lesson.order;
        if (oldOrder === newOrder) {
            return lesson;
        }
        if (newOrder > oldOrder) {
            await this.lessonRepository
                .createQueryBuilder()
                .update(lesson_entity_1.Lesson)
                .set({ order: () => 'order - 1' })
                .where('courseId = :courseId', { courseId: lesson.courseId })
                .andWhere('order > :oldOrder', { oldOrder })
                .andWhere('order <= :newOrder', { newOrder })
                .execute();
        }
        else {
            await this.lessonRepository
                .createQueryBuilder()
                .update(lesson_entity_1.Lesson)
                .set({ order: () => 'order + 1' })
                .where('courseId = :courseId', { courseId: lesson.courseId })
                .andWhere('order >= :newOrder', { newOrder })
                .andWhere('order < :oldOrder', { oldOrder })
                .execute();
        }
        lesson.order = newOrder;
        return this.lessonRepository.save(lesson);
    }
    async getUploadUrl(lessonId, userId) {
        const lesson = await this.findOne(lessonId);
        const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('You do not have permission to upload video for this lesson');
        }
        const key = `courses/${lesson.courseId}/lessons/${lessonId}/video.mp4`;
        return this.minioService.getPresignedUploadUrl(key, 3600);
    }
    async updateVideoUrl(lessonId, videoUrl) {
        const lesson = await this.findOne(lessonId);
        lesson.videoUrl = videoUrl;
        return this.lessonRepository.save(lesson);
    }
    async reorderLessons(courseId, deletedOrder) {
        await this.lessonRepository
            .createQueryBuilder()
            .update(lesson_entity_1.Lesson)
            .set({ order: () => 'order - 1' })
            .where('courseId = :courseId', { courseId })
            .andWhere('order > :deletedOrder', { deletedOrder })
            .execute();
    }
    async checkUserAccess(userId, courseId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            return false;
        const enrollmentRepo = this.lessonRepository.manager.getRepository('Enrollment');
        const enrollment = await enrollmentRepo.findOne({
            where: { studentId: userId, courseId },
        });
        return !!enrollment;
    }
    async checkUserPermission(userId, courseId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            return false;
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course)
            return false;
        if (user.role === 'org_admin' && user.organizationId === course.organizationId) {
            return true;
        }
        if (user.id === course.instructorId) {
            return true;
        }
        return false;
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = LessonsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lesson_entity_1.Lesson)),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        minio_service_1.MinioService])
], LessonsService);
//# sourceMappingURL=lesson.service.js.map