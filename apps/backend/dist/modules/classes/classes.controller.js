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
exports.WebhooksController = exports.TeachersController = exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const classes_service_1 = require("./services/classes.service");
const availability_service_1 = require("./services/availability.service");
const class_dtos_1 = require("./dtos/class.dtos");
const decorators_1 = require("../../shared/decorators");
const enums_1 = require("../../shared/constants/enums");
let ClassesController = class ClassesController {
    classesService;
    availabilityService;
    constructor(classesService, availabilityService) {
        this.classesService = classesService;
        this.availabilityService = availabilityService;
    }
    async bookClass(req, dto) {
        const organizationId = req.user.organizationId;
        return this.classesService.bookClass(req.user.userId, organizationId, dto);
    }
    async getUpcomingClasses(req, days) {
        const daysNum = days ? parseInt(days, 10) : 7;
        return this.classesService.getUpcomingClasses(req.user.userId, daysNum);
    }
    async getClassHistory(req, page, limit) {
        return this.classesService.getClassHistory(req.user.userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async getCalendarFeed(req) {
        const ical = await this.classesService.generateIcalFeed(req.user.userId);
        return {
            content: ical,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': 'attachment; filename="quran-classes.ics"',
            },
        };
    }
    async getClass(id) {
        return this.classesService.getClassById(id);
    }
    async joinClass(id, req) {
        return this.classesService.joinClass(id, req.user.userId, req.user.email);
    }
    async completeClass(id, req) {
        return this.classesService.completeClass(id, req.user.userId);
    }
    async cancelClass(id, req, reason) {
        return this.classesService.cancelClass(id, req.user.userId, reason);
    }
    async addNotes(id, req, dto) {
        return this.classesService.addClassNotes(id, req.user.userId, dto);
    }
    async getRecording(id, req) {
        return this.classesService.getRecording(id, req.user.userId);
    }
    async toggleRecording(id, req, enabled) {
        return this.classesService.toggleRecording(id, req.user.userId, enabled);
    }
    async submitFeedback(id, req, dto) {
        return this.classesService.submitFeedback(id, req.user.userId, dto);
    }
    async getJitsiRoom(id, req) {
        const cls = await this.classesService.getClassById(id);
        const isHost = cls.teacherId === req.user.userId;
        const result = this.classesService['jitsiService'].generateRoomAndToken({
            classId: id,
            userId: req.user.userId,
            userName: req.user.email,
            isHost,
        });
        return result;
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Post)('book'),
    (0, decorators_1.Roles)(enums_1.Role.STUDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, class_dtos_1.BookClassDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "bookClass", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getUpcomingClasses", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getClassHistory", null);
__decorate([
    (0, common_1.Get)('calendar.ics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getCalendarFeed", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getClass", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "joinClass", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, decorators_1.Roles)(enums_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "completeClass", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "cancelClass", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, decorators_1.Roles)(enums_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, class_dtos_1.ClassNotesDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "addNotes", null);
__decorate([
    (0, common_1.Post)(':id/recording'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getRecording", null);
__decorate([
    (0, common_1.Patch)(':id/recording'),
    (0, decorators_1.Roles)(enums_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('enabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "toggleRecording", null);
__decorate([
    (0, common_1.Post)(':id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, class_dtos_1.ClassFeedbackDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Post)('room/:id'),
    (0, decorators_1.Roles)(enums_1.Role.TEACHER, enums_1.Role.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getJitsiRoom", null);
exports.ClassesController = ClassesController = __decorate([
    (0, common_1.Controller)('classes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [classes_service_1.ClassesService,
        availability_service_1.AvailabilityService])
], ClassesController);
let TeachersController = class TeachersController {
    availabilityService;
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async getTeacherAvailability(teacherId, query) {
        return this.availabilityService.getTeacherAvailability(teacherId, query.fromDate, query.toDate);
    }
    async updateAvailability(teacherId, req, dto) {
        if (req.user.userId !== teacherId) {
            throw new common_1.ForbiddenException('Cannot update another teachers availability');
        }
        return this.availabilityService.upsertAvailability(teacherId, {
            dayOfWeek: dto.dayOfWeek,
            startTime: dto.startTime,
            endTime: dto.endTime,
            isRecurring: dto.isRecurring,
            specificDate: dto.specificDate,
            isActive: dto.isActive,
        });
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Get)(':teacherId/availability'),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, class_dtos_1.AvailabilityQueryDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherAvailability", null);
__decorate([
    (0, common_1.Patch)(':teacherId/availability'),
    (0, decorators_1.Roles)(enums_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, class_dtos_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "updateAvailability", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.Controller)('teachers'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], TeachersController);
let WebhooksController = class WebhooksController {
    async handleGoogleCalendarWebhook(body) {
        return { received: true };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('google-calendar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleGoogleCalendarWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('webhooks')
], WebhooksController);
//# sourceMappingURL=classes.controller.js.map