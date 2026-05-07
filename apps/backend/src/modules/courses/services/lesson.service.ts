import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';
import { Course } from '../entities/course.entity';
import { CreateLessonDto, UpdateLessonDto } from '../dto/lesson.dto';
import { UsersService } from '../../users/users.service';
import { MinioService } from '../../../shared/services/minio.service';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly usersService: UsersService,
    private readonly minioService: MinioService,
  ) {}

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async getSignedVideoUrl(id: string, userId: string): Promise<string> {
    const lesson = await this.findOne(id);

    if (lesson.isFree) {
      return lesson.videoUrl;
    }

    const hasAccess = await this.checkUserAccess(userId, lesson.courseId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this lesson');
    }

    if (!lesson.videoUrl) {
      throw new NotFoundException('Video not available');
    }

    return this.minioService.getPresignedDownloadUrl(lesson.videoUrl, 7200);
  }

  async create(courseId: string, dto: CreateLessonDto): Promise<Lesson> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (dto.order === undefined) {
      const maxOrder = await this.lessonRepository
        .createQueryBuilder('lesson')
        .where('lesson.courseId = :courseId', { courseId })
        .select('MAX(lesson.order)', 'maxOrder')
        .getRawOne();
      dto.order = (maxOrder?.maxOrder || 0) + 1;
    }

    const lesson = this.lessonRepository.create({
      ...dto,
      courseId,
    });
    return this.lessonRepository.save(lesson);
  }

  async update(id: string, userId: string, dto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);

    const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to update this lesson');
    }

    Object.assign(lesson, dto);
    return this.lessonRepository.save(lesson);
  }

  async delete(id: string, userId: string): Promise<void> {
    const lesson = await this.findOne(id);

    const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to delete this lesson');
    }

    await this.lessonRepository.remove(lesson);

    await this.reorderLessons(lesson.courseId, lesson.order);
  }

  async reorderLesson(id: string, userId: string, newOrder: number): Promise<Lesson> {
    const lesson = await this.findOne(id);

    const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
    if (!hasPermission) {
      throw new NotFoundException('Lesson not found');
    }

    const oldOrder = lesson.order;

    if (oldOrder === newOrder) {
      return lesson;
    }

    if (newOrder > oldOrder) {
      await this.lessonRepository
        .createQueryBuilder()
        .update(Lesson)
        .set({ order: () => 'order - 1' })
        .where('courseId = :courseId', { courseId: lesson.courseId })
        .andWhere('order > :oldOrder', { oldOrder })
        .andWhere('order <= :newOrder', { newOrder })
        .execute();
    } else {
      await this.lessonRepository
        .createQueryBuilder()
        .update(Lesson)
        .set({ order: () => 'order + 1' })
        .where('courseId = :courseId', { courseId: lesson.courseId })
        .andWhere('order >= :newOrder', { newOrder })
        .andWhere('order < :oldOrder', { oldOrder })
        .execute();
    }

    lesson.order = newOrder;
    return this.lessonRepository.save(lesson);
  }

  async getUploadUrl(lessonId: string, userId: string): Promise<{ uploadUrl: string; bucket: string; key: string }> {
    const lesson = await this.findOne(lessonId);

    const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to upload video for this lesson');
    }

    const key = `courses/${lesson.courseId}/lessons/${lessonId}/video.mp4`;
    return this.minioService.getPresignedUploadUrl(key, 3600);
  }

  async updateVideoUrl(lessonId: string, userId: string, videoUrl: string): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    const hasPermission = await this.checkUserPermission(userId, lesson.courseId);
    if (!hasPermission) {
      throw new NotFoundException('Lesson not found');
    }

    lesson.videoUrl = videoUrl;
    return this.lessonRepository.save(lesson);
  }

  private async reorderLessons(courseId: string, deletedOrder: number): Promise<void> {
    await this.lessonRepository
      .createQueryBuilder()
      .update(Lesson)
      .set({ order: () => 'order - 1' })
      .where('courseId = :courseId', { courseId })
      .andWhere('order > :deletedOrder', { deletedOrder })
      .execute();
  }

  private async checkUserAccess(userId: string, courseId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;

    const enrollmentRepo = this.lessonRepository.manager.getRepository('Enrollment');
    const enrollment = await enrollmentRepo.findOne({
      where: { studentId: userId, courseId },
    });

    return !!enrollment;
  }

  private async checkUserPermission(userId: string, courseId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) return false;

    if (user.role === 'org_admin' && user.organizationId === course.organizationId) {
      return true;
    }
    if (user.id === course.instructorId) {
      return true;
    }
    return false;
  }
}
