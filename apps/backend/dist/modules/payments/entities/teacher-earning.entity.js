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
exports.TeacherEarning = exports.TeacherEarningStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var TeacherEarningStatus;
(function (TeacherEarningStatus) {
    TeacherEarningStatus["PENDING"] = "pending";
    TeacherEarningStatus["PAID"] = "paid";
})(TeacherEarningStatus || (exports.TeacherEarningStatus = TeacherEarningStatus = {}));
let TeacherEarning = class TeacherEarning {
    id;
    teacherId;
    teacher;
    month;
    year;
    grossAmount;
    platformFee;
    netAmount;
    status;
    paidAt;
    createdAt;
};
exports.TeacherEarning = TeacherEarning;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeacherEarning.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'teacher_id' }),
    __metadata("design:type", String)
], TeacherEarning.prototype, "teacherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", user_entity_1.User)
], TeacherEarning.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TeacherEarning.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TeacherEarning.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gross_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TeacherEarning.prototype, "grossAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TeacherEarning.prototype, "platformFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TeacherEarning.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TeacherEarningStatus,
        default: TeacherEarningStatus.PENDING,
    }),
    __metadata("design:type", String)
], TeacherEarning.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TeacherEarning.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeacherEarning.prototype, "createdAt", void 0);
exports.TeacherEarning = TeacherEarning = __decorate([
    (0, typeorm_1.Entity)('teacher_earnings')
], TeacherEarning);
//# sourceMappingURL=teacher-earning.entity.js.map