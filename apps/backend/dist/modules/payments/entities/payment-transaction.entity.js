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
exports.PaymentTransaction = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["CLASS_PAYMENT"] = "class_payment";
    TransactionType["COURSE_REVENUE"] = "course_revenue";
    TransactionType["PLATFORM_FEE"] = "platform_fee";
    TransactionType["PAYOUT"] = "payout";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let PaymentTransaction = class PaymentTransaction {
    id;
    organizationId;
    teacherId;
    teacher;
    stripePaymentIntentId;
    stripeInvoiceId;
    type;
    amount;
    currency;
    status;
    metadata;
    createdAt;
};
exports.PaymentTransaction = PaymentTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id' }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'teacher_id', nullable: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "teacherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", user_entity_1.User)
], PaymentTransaction.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_payment_intent_id', nullable: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_invoice_id', nullable: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "stripeInvoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', default: 'SAR' }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'pending' }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PaymentTransaction.prototype, "createdAt", void 0);
exports.PaymentTransaction = PaymentTransaction = __decorate([
    (0, typeorm_1.Entity)('payment_transactions')
], PaymentTransaction);
//# sourceMappingURL=payment-transaction.entity.js.map