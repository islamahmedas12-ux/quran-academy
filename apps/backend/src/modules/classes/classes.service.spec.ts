import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  ClassesService,
} from './classes.service';
import { ScheduledClass, ClassStatus } from './entities/scheduled-class.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('ClassesService', () => {
  let service: ClassesService;
  let classRepository: jest.Mocked<Repository<ScheduledClass>>;
  let availabilityRepository: jest.Mocked<Repository<AvailabilitySlot>>;
  let usersService: jest.Mocked<UsersService>;

  const mockTeacher: Partial<User> = {
    id: 'teacher-1',
    email: 'teacher@example.com',
    fullName: 'Test Teacher',
    role: UserRole.TEACHER,
    organizationId: 'org-1',
  };

  const mockStudent: Partial<User> = {
    id: 'student-1',
    email: 'student@example.com',
    fullName: 'Test Student',
    role: UserRole.STUDENT,
    organizationId: 'org-1',
  };

  const mockClass: Partial<ScheduledClass> = {
    id: 'class-1',
    teacherId: 'teacher-1',
    studentId: 'student-1',
    organizationId: 'org-1',
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 90000000),
    status: ClassStatus.PENDING,
    topic: 'Quran Reading',
    jitsiRoom: 'quran-academy-test-room',
  };

  beforeEach(async () => {
    const mockClassRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };

    const mockAvailabilityRepo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(ScheduledClass),
          useValue: mockClassRepo,
        },
        {
          provide: getRepositoryToken(AvailabilitySlot),
          useValue: mockAvailabilityRepo,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classRepository = module.get(getRepositoryToken(ScheduledClass));
    availabilityRepository = module.get(getRepositoryToken(AvailabilitySlot));
    usersService = module.get(UsersService);
  });

  describe('bookClass', () => {
    const bookClassDto = {
      teacherId: 'teacher-1',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      topic: 'Quran Reading',
    };

    it('should successfully book a class', async () => {
      usersService.findById.mockResolvedValueOnce(mockStudent as User);
      usersService.findById.mockResolvedValueOnce(mockTeacher as User);
      classRepository.findOne.mockResolvedValue(null);
      classRepository.create.mockReturnValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue(mockClass as ScheduledClass);

      const result = await service.bookClass('student-1', bookClassDto);

      expect(result).toHaveProperty('jitsiRoom');
      expect(result.jitsiRoom).toMatch(/^quran-academy-/);
      expect(classRepository.create).toHaveBeenCalled();
      expect(classRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if student not found', async () => {
      usersService.findById.mockResolvedValueOnce(null);

      await expect(service.bookClass('invalid-student', bookClassDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if teacher not found', async () => {
      usersService.findById.mockResolvedValueOnce(mockStudent as User);
      usersService.findById.mockResolvedValueOnce(null);

      await expect(service.bookClass('student-1', bookClassDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if end time is before start time', async () => {
      usersService.findById.mockResolvedValueOnce(mockStudent as User);
      usersService.findById.mockResolvedValueOnce(mockTeacher as User);

      const invalidDto = {
        ...bookClassDto,
        endTime: new Date(Date.now() - 86400000).toISOString(),
      };

      await expect(service.bookClass('student-1', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if booking in the past', async () => {
      usersService.findById.mockResolvedValueOnce(mockStudent as User);
      usersService.findById.mockResolvedValueOnce(mockTeacher as User);

      const pastDto = {
        ...bookClassDto,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() - 82800000).toISOString(),
      };

      await expect(service.bookClass('student-1', pastDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if time slot is already booked', async () => {
      usersService.findById.mockResolvedValueOnce(mockStudent as User);
      usersService.findById.mockResolvedValueOnce(mockTeacher as User);
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(service.bookClass('student-1', bookClassDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate unique Jitsi room names', async () => {
      usersService.findById.mockResolvedValueOnce(mockStudent as User);
      usersService.findById.mockResolvedValueOnce(mockTeacher as User);
      classRepository.findOne.mockResolvedValue(null);
      classRepository.create.mockReturnValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue(mockClass as ScheduledClass);

      await service.bookClass('student-1', bookClassDto);

      const createCall = classRepository.create.mock.calls[0][0];
      expect(createCall.jitsiRoom).toMatch(/^quran-academy-[a-z0-9]{12}$/);
    });
  });

  describe('findUpcoming', () => {
    it('should return upcoming classes for user', async () => {
      classRepository.find.mockResolvedValue([mockClass as ScheduledClass]);

      const result = await service.findUpcoming('teacher-1');

      expect(result).toHaveLength(1);
      expect(classRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            expect.objectContaining({ teacherId: 'teacher-1' }),
          ]),
          order: { startTime: 'ASC' },
        }),
      );
    });

    it('should return empty array if no upcoming classes', async () => {
      classRepository.find.mockResolvedValue([]);

      const result = await service.findUpcoming('teacher-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return class if user is teacher', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      const result = await service.findOne('class-1', 'teacher-1');

      expect(result).toEqual(mockClass);
    });

    it('should return class if user is student', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      const result = await service.findOne('class-1', 'student-1');

      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException if class not found', async () => {
      classRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'teacher-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(service.findOne('class-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('confirmClass', () => {
    it('should confirm class as teacher', async () => {
      const pendingClass = { ...mockClass, status: ClassStatus.PENDING };
      classRepository.findOne.mockResolvedValue(pendingClass as ScheduledClass);
      classRepository.save.mockResolvedValue({ ...pendingClass, status: ClassStatus.CONFIRMED });

      const result = await service.confirmClass('class-1', 'teacher-1');

      expect(result.status).toBe(ClassStatus.CONFIRMED);
    });

    it('should throw ForbiddenException if not teacher', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(service.confirmClass('class-1', 'student-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelClass', () => {
    it('should allow teacher to cancel class', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue({ ...mockClass, status: ClassStatus.CANCELLED });

      const result = await service.cancelClass('class-1', 'teacher-1');

      expect(result.status).toBe(ClassStatus.CANCELLED);
    });

    it('should allow student to cancel class', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue({ ...mockClass, status: ClassStatus.CANCELLED });

      const result = await service.cancelClass('class-1', 'student-1');

      expect(result.status).toBe(ClassStatus.CANCELLED);
    });

    it('should throw BadRequestException if trying to cancel completed class', async () => {
      const completedClass = { ...mockClass, status: ClassStatus.COMPLETED };
      classRepository.findOne.mockResolvedValue(completedClass as ScheduledClass);

      await expect(service.cancelClass('class-1', 'teacher-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(service.cancelClass('class-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('completeClass', () => {
    it('should mark class as completed by teacher', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue({ ...mockClass, status: ClassStatus.COMPLETED });

      const result = await service.completeClass('class-1', 'teacher-1');

      expect(result.status).toBe(ClassStatus.COMPLETED);
    });

    it('should throw ForbiddenException if not teacher', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(service.completeClass('class-1', 'student-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addNotes', () => {
    it('should add notes to class', async () => {
      const notesDto = { notes: 'Great progress today!' };
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue({ ...mockClass, notes: notesDto.notes });

      const result = await service.addNotes('class-1', 'teacher-1', notesDto);

      expect(result.notes).toBe('Great progress today!');
    });

    it('should throw ForbiddenException if not teacher', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(
        service.addNotes('class-1', 'student-1', { notes: 'test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addTeacherFeedback', () => {
    it('should add teacher feedback and rating', async () => {
      const feedbackDto = { feedback: 'Excellent progress!' };
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockImplementation((entity) => Promise.resolve(entity as ScheduledClass));

      const result = await service.addTeacherFeedback('class-1', 'teacher-1', 5, feedbackDto);

      expect(result.teacherRating).toBe(5);
      expect(result.teacherFeedback).toBe('Excellent progress!');
    });

    it('should throw ForbiddenException if not teacher', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(
        service.addTeacherFeedback('class-1', 'student-1', 5, { feedback: 'test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addStudentFeedback', () => {
    it('should add student feedback and rating', async () => {
      const feedbackDto = { feedback: 'Very helpful class!' };
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockImplementation((entity) => Promise.resolve(entity as ScheduledClass));

      const result = await service.addStudentFeedback('class-1', 'student-1', 4, feedbackDto);

      expect(result.studentRating).toBe(4);
      expect(result.studentFeedback).toBe('Very helpful class!');
    });

    it('should throw ForbiddenException if not student', async () => {
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);

      await expect(
        service.addStudentFeedback('class-1', 'teacher-1', 4, { feedback: 'test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAvailability', () => {
    it('should return teacher availability slots', async () => {
      const mockSlots: Partial<AvailabilitySlot>[] = [
        { id: 'slot-1', teacherId: 'teacher-1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      ];
      availabilityRepository.find.mockResolvedValue(mockSlots as AvailabilitySlot[]);

      const result = await service.getAvailability('teacher-1');

      expect(result).toEqual(mockSlots);
      expect(availabilityRepository.find).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-1', isActive: true },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' },
      });
    });
  });

  describe('setAvailability', () => {
    it('should replace teacher availability slots', async () => {
      const newSlots = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isActive: true },
      ];
      availabilityRepository.create.mockImplementation((data) => data as AvailabilitySlot);
      availabilityRepository.save.mockResolvedValue(newSlots as AvailabilitySlot[]);

      const result = await service.setAvailability('teacher-1', newSlots);

      expect(availabilityRepository.delete).toHaveBeenCalledWith({ teacherId: 'teacher-1' });
      expect(availabilityRepository.create).toHaveBeenCalledTimes(newSlots.length);
    });
  });

  describe('setRecordingUrl', () => {
    it('should set recording URL for class', async () => {
      const recordingUrl = 'https://recordings.example.com/class-1';
      classRepository.findOne.mockResolvedValue(mockClass as ScheduledClass);
      classRepository.save.mockResolvedValue({ ...mockClass, recordingUrl });

      const result = await service.setRecordingUrl('class-1', recordingUrl);

      expect(result.recordingUrl).toBe(recordingUrl);
    });

    it('should throw NotFoundException if class not found', async () => {
      classRepository.findOne.mockResolvedValue(null);

      await expect(service.setRecordingUrl('invalid-id', 'url')).rejects.toThrow(NotFoundException);
    });
  });
});
