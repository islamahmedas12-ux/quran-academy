import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassesService } from './classes.service';
import {
  ScheduledClass,
  ClassStatus,
} from '../entities/scheduled-class.entity';
import { JitsiService } from './jitsi.service';
import { MinioService } from './minio.service';
import { EmailService } from './email.service';
import { AvailabilityService } from './availability.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('ClassesService', () => {
  let service: ClassesService;
  let classRepo: jest.Mocked<Repository<ScheduledClass>>;

  const mockJitsiService = {
    generateRoomAndToken: jest.fn().mockReturnValue({
      roomName: 'quran-class-test-123',
      token: 'test-token',
      jitsiUrl: 'https://meet.jit.si/quran-class-test-123',
    }),
  };

  const mockMinioService = {
    getSignedDownloadUrl: jest
      .fn()
      .mockResolvedValue('https://minio.example.com/signed-url'),
    getRecordingKey: jest.fn().mockReturnValue('classes/test-id/recording.mp4'),
  };

  const mockEmailService = {
    sendClassConfirmation: jest.fn().mockResolvedValue(undefined),
  };

  const mockAvailabilityService = {
    checkSlotAvailable: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(ScheduledClass),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        { provide: JitsiService, useValue: mockJitsiService },
        { provide: MinioService, useValue: mockMinioService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AvailabilityService, useValue: mockAvailabilityService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classRepo = module.get(getRepositoryToken(ScheduledClass));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookClass', () => {
    it('should throw BadRequestException when teacher not available', async () => {
      mockAvailabilityService.checkSlotAvailable.mockResolvedValue(false);

      await expect(
        service.bookClass('student-1', 'org-1', {
          teacherId: 'teacher-1',
          selectedSlot: new Date(Date.now() + 86400000).toISOString(),
          topic: 'Quran Reading',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a class when slot is available', async () => {
      const mockClass = {
        id: 'class-1',
        teacherId: 'teacher-1',
        studentId: 'student-1',
        organizationId: 'org-1',
        status: ClassStatus.PENDING,
      };

      mockAvailabilityService.checkSlotAvailable.mockResolvedValue(true);
      classRepo.findOne.mockResolvedValue(null);
      classRepo.create.mockReturnValue(mockClass as ScheduledClass);
      classRepo.save.mockResolvedValue(mockClass as ScheduledClass);

      const result = await service.bookClass('student-1', 'org-1', {
        teacherId: 'teacher-1',
        selectedSlot: new Date(Date.now() + 86400000).toISOString(),
        topic: 'Quran Reading',
      });

      expect(result).toEqual(mockClass);
    });
  });

  describe('getClassById', () => {
    it('should throw NotFoundException when class not found', async () => {
      classRepo.findOne.mockResolvedValue(null);
      await expect(service.getClassById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return class when found', async () => {
      const mockClass = { id: 'class-1' };
      classRepo.findOne.mockResolvedValue(mockClass as ScheduledClass);
      const result = await service.getClassById('class-1');
      expect(result).toEqual(mockClass);
    });
  });

  describe('joinClass', () => {
    it('should throw ForbiddenException when user is not part of class', async () => {
      classRepo.findOne.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
        studentId: 'student-1',
        startTime: new Date(Date.now() - 3600000),
        status: ClassStatus.PENDING,
      } as ScheduledClass);

      await expect(
        service.joinClass('class-1', 'other-user', 'other@example.com'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateIcalFeed', () => {
    it('should generate valid iCal format', async () => {
      classRepo.find.mockResolvedValue([
        {
          id: 'class-1',
          teacherId: 'teacher-1',
          studentId: 'student-1',
          startTime: new Date('2026-05-15T10:00:00Z'),
          endTime: new Date('2026-05-15T11:00:00Z'),
          topic: 'Test Class',
          notes: '',
        },
      ] as ScheduledClass[]);

      const result = await service.generateIcalFeed('teacher-1');
      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('END:VCALENDAR');
      expect(result).toContain('BEGIN:VEVENT');
      expect(result).toContain('END:VEVENT');
    });
  });
});
