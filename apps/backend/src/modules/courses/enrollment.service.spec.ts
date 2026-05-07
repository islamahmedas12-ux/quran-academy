import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentsService } from './services/enrollment.service';
import { Enrollment } from '../entities/enrollment.entity';
import { LessonProgress } from '../entities/lesson-progress.entity';
import { Course, CourseCategory, CourseDifficulty } from '../entities/course.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let enrollmentRepository: jest.Mocked<Repository<Enrollment>>;
  let lessonProgressRepository: jest.Mocked<Repository<LessonProgress>>;
  let courseRepository: jest.Mocked<Repository<Course>>;
  let usersService: jest.Mocked<UsersService>;

  const mockStudent: Partial<User> = {
    id: 'student-1',
    email: 'student@example.com',
    fullName: 'Test Student',
    role: UserRole.STUDENT,
    organizationId: 'org-1',
  };

  const mockInstructor: Partial<User> = {
    id: 'instructor-1',
    email: 'instructor@example.com',
    fullName: 'Test Instructor',
    role: UserRole.TEACHER,
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
    lessons: [
      { id: 'lesson-1', order: 1 },
      { id: 'lesson-2', order: 2 },
    ],
  };

  const mockEnrollment: Partial<Enrollment> = {
    id: 'enrollment-1',
    studentId: 'student-1',
    courseId: 'course-1',
    progress: 50,
    enrolledAt: new Date(),
  };

  beforeEach(async () => {
    const mockEnrollmentRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    };

    const mockLessonProgressRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    const mockCourseRepo = {
      findOne: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockOrganizationsService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepo,
        },
        {
          provide: getRepositoryToken(LessonProgress),
          useValue: mockLessonProgressRepo,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepo,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    enrollmentRepository = module.get(getRepositoryToken(Enrollment));
    lessonProgressRepository = module.get(getRepositoryToken(LessonProgress));
    courseRepository = module.get(getRepositoryToken(Course));
    usersService = module.get(UsersService);
  });

  describe('enroll', () => {
    it('should enroll student in course', async () => {
      usersService.findById.mockResolvedValue(mockStudent as User);
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      enrollmentRepository.findOne.mockResolvedValue(null);
      enrollmentRepository.create.mockReturnValue(mockEnrollment as Enrollment);
      enrollmentRepository.save.mockResolvedValue(mockEnrollment as Enrollment);

      const result = await service.enroll('student-1', 'course-1');

      expect(result).toEqual(mockEnrollment);
      expect(enrollmentRepository.create).toHaveBeenCalledWith({
        studentId: 'student-1',
        courseId: 'course-1',
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.enroll('invalid-id', 'course-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course not found', async () => {
      usersService.findById.mockResolvedValue(mockStudent as User);
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.enroll('student-1', 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already enrolled', async () => {
      usersService.findById.mockResolvedValue(mockStudent as User);
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      enrollmentRepository.findOne.mockResolvedValue(mockEnrollment as Enrollment);

      await expect(service.enroll('student-1', 'course-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMyEnrollments', () => {
    it('should return student enrollments sorted by date', async () => {
      enrollmentRepository.find.mockResolvedValue([mockEnrollment as Enrollment]);

      const result = await service.findMyEnrollments('student-1');

      expect(result).toHaveLength(1);
      expect(enrollmentRepository.find).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
        relations: ['course', 'course.instructor'],
        order: { enrolledAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return enrollment if student owns it', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);

      const result = await service.findOne('enrollment-1', 'student-1');

      expect(result).toEqual(enrollmentWithCourse);
    });

    it('should allow instructor to access enrollment', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      usersService.findById.mockResolvedValue(mockInstructor as User);

      const result = await service.findOne('enrollment-1', 'instructor-1');

      expect(result).toEqual(enrollmentWithCourse);
    });

    it('should throw ForbiddenException if no access', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      usersService.findById.mockResolvedValue({ ...mockInstructor, id: 'other' } as User);

      await expect(service.findOne('enrollment-1', 'other')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      enrollmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'student-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProgress', () => {
    it('should update lesson progress', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      lessonProgressRepository.findOne.mockResolvedValue(null);
      lessonProgressRepository.create.mockReturnValue({
        enrollmentId: 'enrollment-1',
        lessonId: 'lesson-1',
        isCompleted: true,
      } as LessonProgress);
      lessonProgressRepository.save.mockResolvedValue({
        enrollmentId: 'enrollment-1',
        lessonId: 'lesson-1',
        isCompleted: true,
      } as LessonProgress);
      lessonProgressRepository.count.mockResolvedValue(1);
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);

      const result = await service.updateProgress('enrollment-1', 'student-1', {
        lessonId: 'lesson-1',
        isCompleted: true,
      });

      expect(result.isCompleted).toBe(true);
    });

    it('should update existing progress', async () => {
      const existingProgress = {
        enrollmentId: 'enrollment-1',
        lessonId: 'lesson-1',
        isCompleted: false,
        watchedDuration: 30,
      };
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      lessonProgressRepository.findOne.mockResolvedValue(existingProgress as LessonProgress);
      lessonProgressRepository.save.mockResolvedValue({
        ...existingProgress,
        isCompleted: true,
        watchedDuration: 60,
      } as LessonProgress);
      lessonProgressRepository.count.mockResolvedValue(1);
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);

      const result = await service.updateProgress('enrollment-1', 'student-1', {
        lessonId: 'lesson-1',
        watchedDuration: 60,
        isCompleted: true,
      });

      expect(result.watchedDuration).toBe(60);
    });
  });

  describe('unenroll', () => {
    it('should allow student to unenroll themselves', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      enrollmentRepository.remove.mockResolvedValue(undefined);

      await service.unenroll('enrollment-1', 'student-1');

      expect(enrollmentRepository.remove).toHaveBeenCalled();
    });

    it('should not allow student to unenroll others', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      usersService.findById.mockResolvedValue({ ...mockStudent, role: UserRole.STUDENT } as User);

      await expect(service.unenroll('enrollment-1', 'other-student')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress correctly', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      lessonProgressRepository.count.mockResolvedValue(1);
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e as Enrollment));

      await service.updateProgress('enrollment-1', 'student-1', {
        lessonId: 'lesson-1',
        isCompleted: true,
      });

      expect(enrollmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 50 }),
      );
    });

    it('should mark enrollment as completed when progress reaches 100', async () => {
      const courseWithTwoLessons = {
        ...mockCourse,
        lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
      };
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: courseWithTwoLessons,
        student: mockStudent,
      };
      enrollmentRepository.findOne.mockResolvedValue(enrollmentWithCourse as Enrollment);
      lessonProgressRepository.count.mockResolvedValue(2);
      courseRepository.findOne.mockResolvedValue(courseWithTwoLessons as Course);
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e as Enrollment));

      await service.updateProgress('enrollment-1', 'student-1', {
        lessonId: 'lesson-2',
        isCompleted: true,
      });

      expect(enrollmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          progress: 100,
          completedAt: expect.any(Date),
        }),
      );
    });
  });
});
