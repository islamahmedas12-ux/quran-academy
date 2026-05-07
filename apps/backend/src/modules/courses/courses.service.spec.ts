import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from './services/course.service';
import { Course, CourseCategory, CourseDifficulty } from '../entities/course.entity';
import { UsersService } from '../../users/users.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { User, UserRole } from '../../users/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepository: jest.Mocked<Repository<Course>>;
  let usersService: jest.Mocked<UsersService>;
  let organizationsService: jest.Mocked<OrganizationsService>;

  const mockInstructor: Partial<User> = {
    id: 'instructor-1',
    email: 'instructor@example.com',
    fullName: 'Test Instructor',
    role: UserRole.TEACHER,
    organizationId: 'org-1',
  };

  const mockOrgAdmin: Partial<User> = {
    id: 'admin-1',
    email: 'admin@example.com',
    fullName: 'Org Admin',
    role: UserRole.ORG_ADMIN,
    organizationId: 'org-1',
  };

  const mockCourse: Partial<Course> = {
    id: 'course-1',
    title: 'Quran Tajweed Basics',
    description: 'Learn Tajweed rules',
    category: CourseCategory.TAJWEED,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'ar',
    instructorId: 'instructor-1',
    organizationId: 'org-1',
    isPublished: true,
    isDeleted: false,
    lessons: [],
  };

  beforeEach(async () => {
    const mockCourseRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockOrganizationsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
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

    service = module.get<CoursesService>(CoursesService);
    courseRepository = module.get(getRepositoryToken(Course));
    usersService = module.get(UsersService);
    organizationsService = module.get(OrganizationsService);
  });

  describe('findAll', () => {
    it('should return published non-deleted courses', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCourse]),
      };
      courseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('course.isPublished = :isPublished', {
        isPublished: true,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.isDeleted = :isDeleted', {
        isDeleted: false,
      });
    });

    it('should filter by category', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCourse]),
      };
      courseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ category: CourseCategory.TAJWEED });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'course.category = :category',
        { category: CourseCategory.TAJWEED },
      );
    });

    it('should filter by difficulty', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCourse]),
      };
      courseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ difficulty: CourseDifficulty.BEGINNER });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'course.difficulty = :difficulty',
        { difficulty: CourseDifficulty.BEGINNER },
      );
    });

    it('should search by title or description', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCourse]),
      };
      courseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ search: 'Tajweed' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: '%Tajweed%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return course with lessons sorted by order', async () => {
      const courseWithLessons = {
        ...mockCourse,
        lessons: [
          { id: 'lesson-2', order: 2 },
          { id: 'lesson-1', order: 1 },
        ],
      };
      courseRepository.findOne.mockResolvedValue(courseWithLessons as Course);

      const result = await service.findOne('course-1');

      expect(result.lessons[0].order).toBe(1);
      expect(result.lessons[1].order).toBe(2);
    });

    it('should throw NotFoundException if course not found', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createCourseDto = {
      title: 'New Course',
      description: 'Course description',
      category: CourseCategory.TAJWEED,
      difficulty: CourseDifficulty.INTERMEDIATE,
    };

    it('should create course as instructor', async () => {
      usersService.findById.mockResolvedValue(mockInstructor as User);
      courseRepository.create.mockReturnValue({ ...mockCourse, ...createCourseDto } as Course);
      courseRepository.save.mockResolvedValue({ ...mockCourse, ...createCourseDto } as Course);

      const result = await service.create('instructor-1', createCourseDto);

      expect(result).toHaveProperty('title', 'New Course');
      expect(courseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createCourseDto,
          instructorId: 'instructor-1',
          organizationId: 'org-1',
        }),
      );
    });

    it('should throw NotFoundException if instructor not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.create('invalid-id', createCourseDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    it('should allow instructor to update their course', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      usersService.findById.mockResolvedValue(mockInstructor as User);
      courseRepository.save.mockResolvedValue({ ...mockCourse, ...updateDto } as Course);

      const result = await service.update('course-1', 'instructor-1', updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('should allow org_admin to update course in their org', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      usersService.findById.mockResolvedValue(mockOrgAdmin as User);
      courseRepository.save.mockResolvedValue({ ...mockCourse, ...updateDto } as Course);

      const result = await service.update('course-1', 'admin-1', updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException if user has no permission', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      usersService.findById.mockResolvedValue({ ...mockInstructor, id: 'other-instructor' } as User);

      await expect(
        service.update('course-1', 'other-instructor', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if course not found', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', 'instructor-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should allow org_admin to delete course', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      usersService.findById.mockResolvedValue(mockOrgAdmin as User);
      courseRepository.save.mockResolvedValue({ ...mockCourse, isDeleted: true });

      await service.delete('course-1', 'admin-1');

      expect(courseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: true }),
      );
    });

    it('should not allow instructor to delete course', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      usersService.findById.mockResolvedValue(mockInstructor as User);

      await expect(service.delete('course-1', 'instructor-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('publish', () => {
    it('should publish course', async () => {
      const unpublishedCourse = { ...mockCourse, isPublished: false };
      courseRepository.findOne.mockResolvedValue(unpublishedCourse as Course);
      usersService.findById.mockResolvedValue(mockInstructor as User);
      courseRepository.save.mockResolvedValue({ ...unpublishedCourse, isPublished: true });

      const result = await service.publish('course-1', 'instructor-1');

      expect(result.isPublished).toBe(true);
    });

    it('should throw ForbiddenException if not authorized', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse as Course);
      usersService.findById.mockResolvedValue({ ...mockInstructor, id: 'other' } as User);

      await expect(service.publish('course-1', 'other')).rejects.toThrow(ForbiddenException);
    });
  });
});
