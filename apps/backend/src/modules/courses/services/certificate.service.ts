import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Certificate } from '../entities/certificate.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Course } from '../entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { MinioService } from '../../../shared/services/minio.service';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly minioService: MinioService,
  ) {}

  async generate(enrollmentId: string, userId: string): Promise<Certificate> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['student', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.studentId !== userId) {
      throw new NotFoundException('This enrollment does not belong to you');
    }

    if (enrollment.progress < 100) {
      throw new NotFoundException('Course not yet completed');
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
      throw new NotFoundException('Student or course not found');
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

  async getCertificate(id: string, userId: string): Promise<string> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.studentId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'org_admin') {
        throw new NotFoundException('Certificate not found');
      }
    }

    return this.minioService.getPresignedDownloadUrl(certificate.certificateUrl, 2592000);
  }

  private async generatePDF(
    student: User,
    course: Course,
    enrollment: Enrollment,
  ): Promise<Buffer> {
    try {
      return await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
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
        doc.text(
          `Completion Date: ${enrollment.completedAt?.toLocaleDateString() || new Date().toLocaleDateString()}`,
          { align: 'center' },
        );

        if (course.organization) {
          doc.moveDown(2);
          doc.fontSize(14).fillColor('#059669');
          doc.text(course.organization.name, { align: 'center' });
        }

        doc.end();
      });
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw error;
    }
  }

  private async uploadPDF(uploadUrl: string, buffer: Buffer): Promise<void> {
    try {
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
    } catch (error) {
      this.logger.error('Failed to upload PDF', error);
      throw error;
    }
  }
}
