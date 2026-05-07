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
exports.AvailabilityQueryDto = exports.RecordingResponseDto = exports.JoinClassResponseDto = exports.ClassFeedbackDto = exports.ClassNotesDto = exports.CreateAvailabilityDto = exports.UpdateAvailabilityDto = exports.BookClassDto = void 0;
const class_validator_1 = require("class-validator");
const decorators_1 = require("../../../shared/decorators");
class BookClassDto {
    teacherId;
    selectedSlot;
    topic;
}
exports.BookClassDto = BookClassDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookClassDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    (0, decorators_1.IsFutureDate)(),
    __metadata("design:type", String)
], BookClassDto.prototype, "selectedSlot", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookClassDto.prototype, "topic", void 0);
class UpdateAvailabilityDto {
    dayOfWeek;
    startTime;
    endTime;
    isRecurring;
    specificDate;
    isActive;
}
exports.UpdateAvailabilityDto = UpdateAvailabilityDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], UpdateAvailabilityDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAvailabilityDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAvailabilityDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAvailabilityDto.prototype, "isRecurring", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAvailabilityDto.prototype, "specificDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAvailabilityDto.prototype, "isActive", void 0);
class CreateAvailabilityDto {
    dayOfWeek;
    startTime;
    endTime;
    isRecurring;
    specificDate;
    isActive;
}
exports.CreateAvailabilityDto = CreateAvailabilityDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateAvailabilityDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAvailabilityDto.prototype, "isRecurring", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "specificDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAvailabilityDto.prototype, "isActive", void 0);
class ClassNotesDto {
    notes;
    homeworkUrl;
    homeworkDescription;
}
exports.ClassNotesDto = ClassNotesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClassNotesDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClassNotesDto.prototype, "homeworkUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClassNotesDto.prototype, "homeworkDescription", void 0);
class ClassFeedbackDto {
    rating;
    comment;
}
exports.ClassFeedbackDto = ClassFeedbackDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ClassFeedbackDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClassFeedbackDto.prototype, "comment", void 0);
class JoinClassResponseDto {
    roomName;
    token;
    jitsiUrl;
}
exports.JoinClassResponseDto = JoinClassResponseDto;
class RecordingResponseDto {
    playbackUrl;
    expiresAt;
}
exports.RecordingResponseDto = RecordingResponseDto;
class AvailabilityQueryDto {
    fromDate;
    toDate;
}
exports.AvailabilityQueryDto = AvailabilityQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "toDate", void 0);
//# sourceMappingURL=class.dtos.js.map