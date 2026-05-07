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
var CoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../entities/course.entity");
const users_service_1 = require("../../users/users.service");
const organizations_service_1 = require("../../organizations/organizations.service");
let CoursesService = CoursesService_1 = class CoursesService {
    courseRepository;
    usersService;
    organizationsService;
    logger = new common_1.Logger(CoursesService_1.name);
    constructor(courseRepository, usersService, organizationsService) {
        this.courseRepository = courseRepository;
        this.usersService = usersService;
        this.organizationsService = organizationsService;
    }
    async findAll(query) {
        const qb = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.instructor', 'instructor')
            .where('course.isPublished = :isPublished', { isPublished: true })
            .andWhere('course.isDeleted = :isDeleted', { isDeleted: false });
        if (query.category) {
            qb.andWhere('course.category = :category', { category: query.category });
        }
        if (query.language) {
            qb.andWhere('course.language = :language', { language: query.language });
        }
        if (query.difficulty) {
            qb.andWhere('course.difficulty = :difficulty', { difficulty: query.difficulty });
        }
        if (query.search) {
            qb.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        qb.orderBy('course.createdAt', 'DESC');
        return qb.getMany();
    }
    async findOne(id) {
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: ['instructor', 'lessons'],
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        course.lessons = course.lessons.sort((a, b) => a.order - b.order);
        return course;
    }
    async create(instructorId, dto) {
        const instructor = await this.usersService.findById(instructorId);
        if (!instructor) {
            throw new common_1.NotFoundException('Instructor not found');
        }
        const course = this.courseRepository.create({
            ...dto,
            instructorId,
            organizationId: instructor.organizationId,
        });
        return this.courseRepository.save(course);
    }
    async update(id, userId, dto) {
        const course = await this.findOne(id);
        const canEdit = await this.canUserEditCourse(userId, course);
        if (!canEdit) {
            throw new common_1.ForbiddenException('You do not have permission to edit this course');
        }
        Object.assign(course, dto);
        return this.courseRepository.save(course);
    }
    async delete(id, userId) {
        const course = await this.findOne(id);
        const canDelete = await this.canUserDeleteCourse(userId, course);
        if (!canDelete) {
            throw new common_1.ForbiddenException('You do not have permission to delete this course');
        }
        course.isDeleted = true;
        await this.courseRepository.save(course);
    }
    async publish(id, userId) {
        const course = await this.findOne(id);
        const canEdit = await this.canUserEditCourse(userId, course);
        if (!canEdit) {
            throw new common_1.ForbiddenException('You do not have permission to publish this course');
        }
        course.isPublished = true;
        return this.courseRepository.save(course);
    }
    async canUserEditCourse(userId, course) {
        const user = await this.usersService.findById(userId);
        if (!user)
            return false;
        if (user.role === 'org_admin' && user.organizationId === course.organizationId) {
            return true;
        }
        if (user.id === course.instructorId) {
            return true;
        }
        return false;
    }
    async canUserDeleteCourse(userId, course) {
        const user = await this.usersService.findById(userId);
        if (!user)
            return false;
        if (user.role === 'org_admin' && user.organizationId === course.organizationId) {
            return true;
        }
        return false;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = CoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        organizations_service_1.OrganizationsService])
], CoursesService);
//# sourceMappingURL=course.service.js.map