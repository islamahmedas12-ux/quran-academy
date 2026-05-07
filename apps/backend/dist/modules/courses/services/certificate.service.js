"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CertificateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const PDFDocument = __importStar(require("pdfkit"));
const certificate_entity_1 = require("../entities/certificate.entity");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const course_entity_1 = require("../entities/course.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const minio_service_1 = require("../../../shared/services/minio.service");
let CertificateService = CertificateService_1 = class CertificateService {
    certificateRepository;
    enrollmentRepository;
    courseRepository;
    userRepository;
    minioService;
    logger = new common_1.Logger(CertificateService_1.name);
    constructor(certificateRepository, enrollmentRepository, courseRepository, userRepository, minioService) {
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.minioService = minioService;
    }
    async generate(enrollmentId, userId) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
            relations: ['student', 'course'],
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.studentId !== userId) {
            throw new common_1.NotFoundException('This enrollment does not belong to you');
        }
        if (enrollment.progress < 100) {
            throw new common_1.NotFoundException('Course not yet completed');
        }
        const existing = await this.certificateRepository.findOne({
            where: { enrollmentId },
        });
        if (existing) {
            return existing;
        }
        const student = await this.userRepository.findOne({
            where: { id: enrollment.studentId },
        });
        const course = await this.courseRepository.findOne({
            where: { id: enrollment.courseId },
            relations: ['organization'],
        });
        if (!student || !course) {
            throw new common_1.NotFoundException('Student or course not found');
        }
        const pdfBuffer = await this.generatePDF(student, course, enrollment);
        const key = `certificates/${enrollmentId}.pdf`;
        const { uploadUrl } = await this.minioService.getPresignedUploadUrl(key, 60);
        await this.uploadPDF(uploadUrl, pdfBuffer);
        const certificate = this.certificateRepository.create({
            enrollmentId,
            studentId: userId,
            courseId: enrollment.courseId,
            certificateUrl: key,
        });
        return this.certificateRepository.save(certificate);
    }
    async getCertificate(id, userId) {
        const certificate = await this.certificateRepository.findOne({
            where: { id },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        if (certificate.studentId !== userId) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || user.role !== 'org_admin') {
                throw new common_1.NotFoundException('Certificate not found');
            }
        }
        return this.minioService.getPresignedDownloadUrl(certificate.certificateUrl, 2592000);
    }
    async generatePDF(student, course, enrollment) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#059669');
            doc
                .fontSize(40)
                .fillColor('#059669')
                .text('Certificate of Completion', 0, 80, { align: 'center' });
            doc.moveDown();
            doc.fontSize(20).fillColor('#333');
            doc.text('This is to certify that', { align: 'center' });
            doc.moveDown();
            doc.fontSize(30).fillColor('#D97706');
            doc.text(student.fullName || student.email, { align: 'center' });
            doc.moveDown();
            doc.fontSize(20).fillColor('#333');
            doc.text('has successfully completed the course', { align: 'center' });
            doc.moveDown();
            doc.fontSize(28).fillColor('#059669');
            doc.text(course.title, { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).fillColor('#666');
            doc.text(`Completion Date: ${enrollment.completedAt?.toLocaleDateString() || new Date().toLocaleDateString()}`, { align: 'center' });
            if (course.organization) {
                doc.moveDown(2);
                doc.fontSize(14).fillColor('#059669');
                doc.text(course.organization.name, { align: 'center' });
            }
            doc.end();
        });
    }
    async uploadPDF(uploadUrl, buffer) {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: buffer,
            headers: {
                'Content-Type': 'application/pdf',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to upload certificate: ${response.statusText}`);
        }
    }
};
exports.CertificateService = CertificateService;
exports.CertificateService = CertificateService = CertificateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(certificate_entity_1.Certificate)),
    __param(1, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __param(2, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        minio_service_1.MinioService])
], CertificateService);
//# sourceMappingURL=certificate.service.js.map