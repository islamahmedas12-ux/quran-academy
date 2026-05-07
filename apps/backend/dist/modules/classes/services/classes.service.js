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
var ClassesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scheduled_class_entity_1 = require("../entities/scheduled-class.entity");
const jitsi_service_1 = require("./jitsi.service");
const minio_service_1 = require("./minio.service");
const email_service_1 = require("./email.service");
const availability_service_1 = require("./availability.service");
const enums_1 = require("../../../shared/constants/enums");
let ClassesService = ClassesService_1 = class ClassesService {
    classRepo;
    jitsiService;
    minioService;
    emailService;
    availabilityService;
    logger = new common_1.Logger(ClassesService_1.name);
    constructor(classRepo, jitsiService, minioService, emailService, availabilityService) {
        this.classRepo = classRepo;
        this.jitsiService = jitsiService;
        this.minioService = minioService;
        this.emailService = emailService;
        this.availabilityService = availabilityService;
    }
    async bookClass(studentId, organizationId, dto) {
        const startTime = new Date(dto.selectedSlot);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        const isAvailable = await this.availabilityService.checkSlotAvailable(dto.teacherId, startTime, endTime);
        if (!isAvailable) {
            throw new common_1.BadRequestException('Teacher is not available at this time slot');
        }
        const existing = await this.classRepo.findOne({
            where: {
                teacherId: dto.teacherId,
                startTime,
                status: (0, typeorm_2.In)([enums_1.ClassStatus.PENDING, enums_1.ClassStatus.CONFIRMED]),
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('This time slot is already booked');
        }
        const { roomName, token, jitsiUrl } = this.jitsiService.generateRoomAndToken({
            classId: `temp-${Date.now()}`,
            userId: studentId,
            userName: 'Student',
        });
        const scheduledClass = this.classRepo.create({
            teacherId: dto.teacherId,
            studentId,
            organizationId,
            startTime,
            endTime,
            topic: dto.topic,
            jitsiRoom: roomName,
            status: enums_1.ClassStatus.PENDING,
        });
        return this.classRepo.save(scheduledClass);
    }
    async getUpcomingClasses(studentId, days = 7) {
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return this.classRepo.find({
            where: {
                studentId,
                startTime: (0, typeorm_2.Between)(now, future),
                status: (0, typeorm_2.In)([enums_1.ClassStatus.PENDING, enums_1.ClassStatus.CONFIRMED]),
            },
            order: { startTime: 'ASC' },
        });
    }
    async getClassById(classId) {
        const classEntity = await this.classRepo.findOne({ where: { id: classId } });
        if (!classEntity) {
            throw new common_1.NotFoundException('Class not found');
        }
        return classEntity;
    }
    async joinClass(classId, userId, userName) {
        const classEntity = await this.getClassById(classId);
        if (classEntity.studentId !== userId && classEntity.teacherId !== userId) {
            throw new common_1.ForbiddenException('You are not part of this class');
        }
        if (new Date() < classEntity.startTime) {
            throw new common_1.BadRequestException('Class has not started yet');
        }
        const isHost = classEntity.teacherId === userId;
        const { roomName, token, jitsiUrl } = this.jitsiService.generateRoomAndToken({
            classId,
            userId,
            userName,
            isHost,
        });
        classEntity.jitsiRoom = roomName;
        classEntity.status = enums_1.ClassStatus.IN_PROGRESS;
        await this.classRepo.save(classEntity);
        return { roomName, token, jitsiUrl };
    }
    async completeClass(classId, teacherId) {
        const classEntity = await this.getClassById(classId);
        if (classEntity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('Only the teacher can complete the class');
        }
        classEntity.status = enums_1.ClassStatus.COMPLETED;
        return this.classRepo.save(classEntity);
    }
    async cancelClass(classId, userId, reason) {
        const classEntity = await this.getClassById(classId);
        const isTeacherOrStudent = classEntity.teacherId === userId || classEntity.studentId === userId;
        if (!isTeacherOrStudent) {
            throw new common_1.ForbiddenException('You cannot cancel this class');
        }
        const hoursUntilStart = (classEntity.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilStart < 24 && classEntity.teacherId === userId) {
            throw new common_1.BadRequestException('Cannot cancel within 24 hours of class start');
        }
        classEntity.status = enums_1.ClassStatus.CANCELLED;
        classEntity.cancelledAt = new Date();
        classEntity.cancelReason = reason || '';
        return this.classRepo.save(classEntity);
    }
    async getClassHistory(userId, page = 1, limit = 20) {
        const [data, total] = await this.classRepo.findAndCount({
            where: [{ teacherId: userId }, { studentId: userId }],
            order: { startTime: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
    async addClassNotes(classId, teacherId, dto) {
        const classEntity = await this.getClassById(classId);
        if (classEntity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('Only the teacher can add notes');
        }
        Object.assign(classEntity, {
            notes: dto.notes,
            homeworkUrl: dto.homeworkUrl,
            homeworkDescription: dto.homeworkDescription,
        });
        return this.classRepo.save(classEntity);
    }
    async getRecording(classId, userId) {
        const classEntity = await this.getClassById(classId);
        if (classEntity.studentId !== userId && classEntity.teacherId !== userId) {
            throw new common_1.ForbiddenException('You are not part of this class');
        }
        if (!classEntity.recordingEnabled || !classEntity.recordingKey) {
            throw new common_1.NotFoundException('Recording not available');
        }
        const expiresAt = new Date(Date.now() + 3600 * 1000);
        const playbackUrl = await this.minioService.getSignedDownloadUrl(classEntity.recordingKey, 3600);
        return { playbackUrl, expiresAt };
    }
    async submitFeedback(classId, userId, dto) {
        const classEntity = await this.getClassById(classId);
        const isTeacher = classEntity.teacherId === userId;
        const isStudent = classEntity.studentId === userId;
        if (!isTeacher && !isStudent) {
            throw new common_1.ForbiddenException('You are not part of this this class');
        }
        if (isTeacher) {
            classEntity.teacherRating = dto.rating;
            classEntity.teacherComment = dto.comment || '';
            classEntity.teacherFeedbackAt = new Date();
        }
        else {
            classEntity.studentRating = dto.rating;
            classEntity.studentComment = dto.comment || '';
            classEntity.studentFeedbackAt = new Date();
        }
        if (classEntity.teacherFeedbackAt &&
            classEntity.studentFeedbackAt &&
            classEntity.status !== enums_1.ClassStatus.COMPLETED) {
            classEntity.status = enums_1.ClassStatus.COMPLETED;
        }
        return this.classRepo.save(classEntity);
    }
    async toggleRecording(classId, teacherId, enabled) {
        const classEntity = await this.getClassById(classId);
        if (classEntity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('Only the teacher can toggle recording');
        }
        classEntity.recordingEnabled = enabled;
        if (enabled) {
            classEntity.recordingKey = this.minioService.getRecordingKey(classId);
        }
        return this.classRepo.save(classEntity);
    }
    async generateIcalFeed(userId) {
        const classes = await this.classRepo.find({
            where: [{ teacherId: userId }, { studentId: userId }],
            order: { startTime: 'ASC' },
        });
        let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Quran Academy//NONSGML v1.0//EN\r\n';
        for (const cls of classes) {
            const uid = `${cls.id}@quran-academy.com`;
            const dtstart = cls.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const dtend = cls.endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const summary = `Quran Class${cls.topic ? `: ${cls.topic}` : ''}`;
            const description = cls.notes || '';
            ical += `BEGIN:VEVENT\r\n`;
            ical += `UID:${uid}\r\n`;
            ical += `DTSTART:${dtstart}\r\n`;
            ical += `DTEND:${dtend}\r\n`;
            ical += `SUMMARY:${summary}\r\n`;
            ical += `DESCRIPTION:${description}\r\n`;
            ical += `END:VEVENT\r\n`;
        }
        ical += 'END:VCALENDAR\r\n';
        return ical;
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = ClassesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scheduled_class_entity_1.ScheduledClass)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jitsi_service_1.JitsiService,
        minio_service_1.MinioService,
        email_service_1.EmailService,
        availability_service_1.AvailabilityService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map