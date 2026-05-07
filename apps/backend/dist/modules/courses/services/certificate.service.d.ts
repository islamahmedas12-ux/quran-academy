import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Course } from '../entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { MinioService } from '../../../shared/services/minio.service';
export declare class CertificateService {
    private readonly certificateRepository;
    private readonly enrollmentRepository;
    private readonly courseRepository;
    private readonly userRepository;
    private readonly minioService;
    private readonly logger;
    constructor(certificateRepository: Repository<Certificate>, enrollmentRepository: Repository<Enrollment>, courseRepository: Repository<Course>, userRepository: Repository<User>, minioService: MinioService);
    generate(enrollmentId: string, userId: string): Promise<Certificate>;
    getCertificate(id: string, userId: string): Promise<string>;
    private generatePDF;
    private uploadPDF;
}
