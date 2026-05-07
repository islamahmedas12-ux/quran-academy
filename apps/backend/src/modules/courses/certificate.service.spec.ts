import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateService } from './services/certificate.service';
import { Certificate } from '../entities/certificate.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Course, CourseCategory, CourseDifficulty } from '../entities/course.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { MinioService } from '../../../shared/services/minio.service';
import { NotFoundException } from '@nestjs/common';

describe('CertificateService', () => {
  let service: CertificateService;
  let certificateRepository: jest.Mocked<Repository<Certificate>>;
  let enrollmentRepository: jest.Mocked<Repository<Enrollment>>;
  let courseRepository: jest.Mocked<Repository<Course>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let minioService: jest.Mocked<MinioService>;

  const mockStudent: Partial<User> = {
    id: 'student-1',
    email: 'student@example.com',
    fullName: 'Ahmed Mohammed',
    role: UserRole.STUDENT,
    organizationId: 'org-1',
  };

  const mockCourse: Partial<Course> = {
    id: 'course-1',
    title: 'Quran Tajweed Basics',
    description: 'Learn Tajweed rules',
    category: CourseCategory.TAJWEED,
    difficulty: CourseDifficulty.BEGINNER,
    instructorId: 'instructor-1',
    organizationId: 'org-1',
    organization: { id: 'org-1', name: 'Quran Academy' },
  };

  const mockEnrollment: Partial<Enrollment> = {
    id: 'enrollment-1',
    studentId: 'student-1',
    courseId: 'course-1',
    progress: 100,
    completedAt: new Date(),
    student: mockStudent as User,
    course: mockCourse as Course,
  };

  const mockCertificate: Partial<Certificate> = {
    id: 'cert-1',
    enrollmentId: 'enrollment-1',
    studentId: 'student-1',
    courseId: 'course-1',
    certificateUrl: 'certificates/enrollment-1.pdf',
  };

  beforeEach(async () => {
    const mockCertificateRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockEnrollmentRepo = {
      findOne: jest.fn(),
    };

    const mockCourseRepo = {
      findOne: jest.fn(),
    };

    const mockUserRepo = {
      findOne: jest.fn(),
    };

    const mockMinioService = {
      getPresignedUploadUrl: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        {
          provide: getRepositoryToken(Certificate),
          useValue: mockCertificateRepo,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepo,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
    certificateRepository = module.get(getRepositoryToken(Certificate));
    enrollmentRepository = module.get(getRepositoryToken(Enrollment));
    courseRepository = module.get(getRepositoryToken(Course));
    userRepository = module.get(getRepositoryToken(User));
    minioService = module.get(MinioService);
  });

  describe('generate', () => {
    it('should generate certificate for completed course', async () => {
      const completedEnrollment = { ...mockEnrollment, progress: 100 };
      enrollmentRepository.findOne.mockResolvedValue(completedEnrollment as Enrollment);
      certificateRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(mockStudent as User);
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      minioService.getPresignedUploadUrl.mockResolvedValue({
        uploadUrl: 'https://storage.example.com/upload',
        bucket: 'certificates',
        key: 'certificates/enrollment-1.pdf',
      });
      certificateRepository.create.mockReturnValue(mockCertificate as Certificate);
      certificateRepository.save.mockResolvedValue(mockCertificate as Certificate);

      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await service.generate('enrollment-1', 'student-1');

      expect(result).toEqual(mockCertificate);
      expect(certificateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          enrollmentId: 'enrollment-1',
          studentId: 'student-1',
          courseId: 'course-1',
        }),
      );
    });

    it('should return existing certificate if already generated', async () => {
      enrollmentRepository.findOne.mockResolvedValue(mockEnrollment as Enrollment);
      certificateRepository.findOne.mockResolvedValue(mockCertificate as Certificate);

      const result = await service.generate('enrollment-1', 'student-1');

      expect(result).toEqual(mockCertificate);
      expect(certificateRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      enrollmentRepository.findOne.mockResolvedValue(null);

      await expect(service.generate('invalid-id', 'student-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if enrollment belongs to different student', async () => {
      enrollmentRepository.findOne.mockResolvedValue(mockEnrollment as Enrollment);

      await expect(service.generate('enrollment-1', 'other-student')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if course not completed', async () => {
      const incompleteEnrollment = { ...mockEnrollment, progress: 50 };
      enrollmentRepository.findOne.mockResolvedValue(incompleteEnrollment as Enrollment);

      await expect(service.generate('enrollment-1', 'student-1')).rejects.toThrow(
        'Course not yet completed',
      );
    });
  });

  describe('getCertificate', () => {
    it('should return download URL for certificate owner', async () => {
      certificateRepository.findOne.mockResolvedValue(mockCertificate as Certificate);
      minioService.getPresignedDownloadUrl.mockResolvedValue(
        'https://storage.example.com/download/cert.pdf',
      );

      const result = await service.getCertificate('cert-1', 'student-1');

      expect(result).toContain('storage.example.com');
    });

    it('should allow org_admin to access any certificate', async () => {
      certificateRepository.findOne.mockResolvedValue(mockCertificate as Certificate);
      userRepository.findOne.mockResolvedValue({ ...mockStudent, role: UserRole.ORG_ADMIN } as User);
      minioService.getPresignedDownloadUrl.mockResolvedValue(
        'https://storage.example.com/download/cert.pdf',
      );

      const result = await service.getCertificate('cert-1', 'admin-1');

      expect(result).toContain('storage.example.com');
    });

    it('should throw NotFoundException for invalid certificate', async () => {
      certificateRepository.findOne.mockResolvedValue(null);

      await expect(service.getCertificate('invalid-id', 'student-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user has no access', async () => {
      certificateRepository.findOne.mockResolvedValue(mockCertificate as Certificate);
      userRepository.findOne.mockResolvedValue({ ...mockStudent, id: 'other' } as User);

      await expect(service.getCertificate('cert-1', 'other')).rejects.toThrow(NotFoundException);
    });
  });
});
