import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseCategory, CourseDifficulty } from '../entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../dto/course.dto';
import { UsersService } from '../../users/users.service';
import { OrganizationsService } from '../../organizations/organizations.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async findAll(query: CourseQueryDto): Promise<Course[]> {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.isPublished = :isPublished', { isPublished: true })
      .andWhere('course.isDeleted = :isDeleted', { isDeleted: false });

    if (query.category) {
      qb.andWhere('course.category = :category', { category: query.category });
    }
    if (query.language) {
      qb.andWhere('course.language = :language', { language: query.language });
    }
    if (query.difficulty) {
      qb.andWhere('course.difficulty = :difficulty', { difficulty: query.difficulty });
    }
    if (query.search) {
      qb.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('course.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'lessons'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    course.lessons = course.lessons.sort((a, b) => a.order - b.order);
    return course;
  }

  async create(instructorId: string, dto: CreateCourseDto): Promise<Course> {
    const instructor = await this.usersService.findById(instructorId);
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const course = this.courseRepository.create({
      ...dto,
      instructorId,
      organizationId: instructor.organizationId,
    });
    return this.courseRepository.save(course);
  }

  async update(id: string, userId: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    const canEdit = await this.canUserEditCourse(userId, course);
    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this course');
    }

    Object.assign(course, dto);
    return this.courseRepository.save(course);
  }

  async delete(id: string, userId: string): Promise<void> {
    const course = await this.findOne(id);

    const canDelete = await this.canUserDeleteCourse(userId, course);
    if (!canDelete) {
      throw new NotFoundException('Course not found');
    }

    course.isDeleted = true;
    await this.courseRepository.save(course);
  }

  async publish(id: string, userId: string): Promise<Course> {
    const course = await this.findOne(id);

    const canEdit = await this.canUserEditCourse(userId, course);
    if (!canEdit) {
      throw new NotFoundException('Course not found');
    }

    course.isPublished = true;
    return this.courseRepository.save(course);
  }

  private async canUserEditCourse(userId: string, course: Course): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;

    if (user.role === 'org_admin' && user.organizationId === course.organizationId) {
      return true;
    }
    if (user.id === course.instructorId) {
      return true;
    }
    return false;
  }

  private async canUserDeleteCourse(userId: string, course: Course): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;

    if (user.role === 'org_admin' && user.organizationId === course.organizationId) {
      return true;
    }
    return false;
  }
}
