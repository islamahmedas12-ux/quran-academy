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
var TeacherPayoutsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherPayoutsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_earning_entity_1 = require("../entities/teacher-earning.entity");
const payment_transaction_entity_1 = require("../entities/payment-transaction.entity");
let TeacherPayoutsService = TeacherPayoutsService_1 = class TeacherPayoutsService {
    earningRepository;
    transactionRepository;
    logger = new common_1.Logger(TeacherPayoutsService_1.name);
    platformFeePercent = 15;
    constructor(earningRepository, transactionRepository) {
        this.earningRepository = earningRepository;
        this.transactionRepository = transactionRepository;
    }
    async getTeacherEarnings(teacherId, year) {
        const query = this.earningRepository
            .createQueryBuilder('earning')
            .where('earning.teacherId = :teacherId', { teacherId });
        if (year) {
            query.andWhere('earning.year = :year', { year });
        }
        query.orderBy('earning.year', 'DESC').addOrderBy('earning.month', 'DESC');
        return query.getMany();
    }
    async calculateEarnings(teacherId, month, year) {
        const transactions = await this.transactionRepository.find({
            where: {
                teacherId,
                type: payment_transaction_entity_1.TransactionType.CLASS_PAYMENT,
            },
        });
        const filteredTransactions = transactions.filter((t) => {
            const txDate = new Date(t.createdAt);
            return txDate.getMonth() + 1 === month && txDate.getFullYear() === year;
        });
        const grossAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const platformFee = grossAmount * (this.platformFeePercent / 100);
        const netAmount = grossAmount - platformFee;
        let earning = await this.earningRepository.findOne({
            where: { teacherId, month, year },
        });
        if (earning) {
            earning.grossAmount = grossAmount;
            earning.platformFee = platformFee;
            earning.netAmount = netAmount;
        }
        else {
            earning = this.earningRepository.create({
                teacherId,
                month,
                year,
                grossAmount,
                platformFee,
                netAmount,
                status: teacher_earning_entity_1.TeacherEarningStatus.PENDING,
            });
        }
        return this.earningRepository.save(earning);
    }
    async markAsPaid(teacherId, month, year) {
        const earning = await this.earningRepository.findOne({
            where: { teacherId, month, year },
        });
        if (!earning) {
            throw new common_1.NotFoundException(`Earnings not found for ${month}/${year}`);
        }
        earning.status = teacher_earning_entity_1.TeacherEarningStatus.PAID;
        earning.paidAt = new Date();
        const transaction = this.transactionRepository.create({
            organizationId: '',
            teacherId,
            type: payment_transaction_entity_1.TransactionType.PAYOUT,
            amount: earning.netAmount,
            metadata: {
                earningId: earning.id,
                month,
                year,
            },
        });
        await this.transactionRepository.save(transaction);
        return this.earningRepository.save(earning);
    }
    async recordClassPayment(teacherId, organizationId, classId, amount) {
        const transaction = this.transactionRepository.create({
            teacherId,
            organizationId,
            type: payment_transaction_entity_1.TransactionType.CLASS_PAYMENT,
            amount,
            metadata: { classId },
        });
        await this.transactionRepository.save(transaction);
    }
    async getEarningsSummary(teacherId) {
        const earnings = await this.earningRepository.find({
            where: { teacherId },
        });
        return {
            totalGross: earnings.reduce((sum, e) => sum + Number(e.grossAmount), 0),
            totalNet: earnings.reduce((sum, e) => sum + Number(e.netAmount), 0),
            totalPending: earnings
                .filter((e) => e.status === teacher_earning_entity_1.TeacherEarningStatus.PENDING)
                .reduce((sum, e) => sum + Number(e.netAmount), 0),
            totalPaid: earnings
                .filter((e) => e.status === teacher_earning_entity_1.TeacherEarningStatus.PAID)
                .reduce((sum, e) => sum + Number(e.netAmount), 0),
        };
    }
};
exports.TeacherPayoutsService = TeacherPayoutsService;
exports.TeacherPayoutsService = TeacherPayoutsService = TeacherPayoutsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_earning_entity_1.TeacherEarning)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_transaction_entity_1.PaymentTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TeacherPayoutsService);
//# sourceMappingURL=teacher-payouts.service.js.map