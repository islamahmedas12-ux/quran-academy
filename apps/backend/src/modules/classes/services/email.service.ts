import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@quran-academy.com',
    );
  }

  async sendClassConfirmation(params: {
    teacherEmail: string;
    studentEmail: string;
    teacherName: string;
    studentName: string;
    startTime: Date;
    topic?: string;
    jitsiUrl?: string;
  }): Promise<void> {
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

  async sendClassNotes(params: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    startTime: Date;
    notes?: string;
    homeworkUrl?: string;
    homeworkDescription?: string;
  }): Promise<void> {
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

  private async send(options: EmailOptions): Promise<void> {
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
    this.logger.debug(`Email content: ${options.html.substring(0, 100)}...`);
  }
}
