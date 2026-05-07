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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    fromAddress;
    constructor(configService) {
        this.configService = configService;
        this.fromAddress = this.configService.get('EMAIL_FROM', 'noreply@quran-academy.com');
    }
    async sendClassConfirmation(params) {
        const html = `
      <h2>Class Scheduled</h2>
      <p>Hello ${params.teacherName},</p>
      <p>A new class has been scheduled:</p>
      <ul>
        <li><strong>Student:</strong> ${params.studentName}</li>
        <li><strong>Time:</strong> ${params.startTime.toISOString()}</li>
        <li><strong>Topic:</strong> ${params.topic || 'Not specified'}</li>
      </ul>
      ${params.jitsiUrl ? `<p><a href="${params.jitsiUrl}">Join Class</a></p>` : ''}
      <p>Best regards,<br/>Quran Academy</p>
    `;
        await this.send({
            to: params.teacherEmail,
            subject: 'Class Scheduled - Quran Academy',
            html,
        });
        const studentHtml = `
      <h2>Class Confirmation</h2>
      <p>Hello ${params.studentName},</p>
      <p>Your class has been confirmed:</p>
      <ul>
        <li><strong>Teacher:</strong> ${params.teacherName}</li>
        <li><strong>Time:</strong> ${params.startTime.toISOString()}</li>
        <li><strong>Topic:</strong> ${params.topic || 'Not specified'}</li>
      </ul>
      ${params.jitsiUrl ? `<p><a href="${params.jitsiUrl}">Join Class</a></p>` : ''}
      <p>Best regards,<br/>Quran Academy</p>
    `;
        await this.send({
            to: params.studentEmail,
            subject: 'Class Confirmed - Quran Academy',
            html: studentHtml,
        });
    }
    async sendClassNotes(params) {
        const html = `
      <h2>Class Notes</h2>
      <p>Hello ${params.studentName},</p>
      <p>Your teacher ${params.teacherName} has shared class notes:</p>
      ${params.notes ? `<h3>Notes:</h3><p>${params.notes}</p>` : ''}
      ${params.homeworkDescription ? `<h3>Homework:</h3><p>${params.homeworkDescription}</p>` : ''}
      ${params.homeworkUrl ? `<p><a href="${params.homeworkUrl}">Download Homework</a></p>` : ''}
      <p>Best regards,<br/>Quran Academy</p>
    `;
        await this.send({
            to: params.studentEmail,
            subject: `Class Notes - ${params.startTime.toISOString().split('T')[0]}`,
            html,
        });
    }
    async send(options) {
        this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
        this.logger.debug(`Email content: ${options.html.substring(0, 100)}...`);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map