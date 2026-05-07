import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoursesService } from './services/course.service';
import { LessonsService } from './services/lesson.service';
import { EnrollmentsService } from './services/enrollment.service';
import { CertificateService } from './services/certificate.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './dto/course.dto';
import { CreateLessonDto, UpdateLessonDto, LessonOrderDto } from './dto/lesson.dto';
import { UpdateProgressDto } from './dto/enrollment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller()
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly lessonsService: LessonsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly certificateService: CertificateService,
  ) {}

  @Get('courses')
  async listCourses(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get('courses/:id')
  async getCourse(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post('courses')
  @UseGuards(JwtAuthGuard)
  async createCourse(@Body() dto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(req.user.id, dto);
  }

  @Patch('courses/:id')
  @UseGuards(JwtAuthGuard)
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Request() req) {
    return this.coursesService.update(id, req.user.id, dto);
  }

  @Delete('courses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCourse(@Param('id') id: string, @Request() req) {
    await this.coursesService.delete(id, req.user.id);
    return { success: true };
  }

  @Post('courses/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publishCourse(@Param('id') id: string, @Request() req) {
    return this.coursesService.publish(id, req.user.id);
  }

  @Get('courses/:courseId/lessons')
  async listLessons(@Param('courseId') courseId: string) {
    return this.lessonsService.findByCourse(courseId);
  }

  @Get('lessons/:id')
  async getLesson(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get('lessons/:id/video')
  @UseGuards(JwtAuthGuard)
  async getLessonVideo(@Param('id') id: string, @Request() req) {
    const url = await this.lessonsService.getSignedVideoUrl(id, req.user.id);
    return { videoUrl: url };
  }

  @Post('lessons')
  @UseGuards(JwtAuthGuard)
  async createLesson(@Body() dto: CreateLessonDto & { courseId: string }, @Request() req) {
    return this.lessonsService.create(dto.courseId, dto);
  }

  @Patch('lessons/:id')
  @UseGuards(JwtAuthGuard)
  async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto, @Request() req) {
    return this.lessonsService.update(id, req.user.id, dto);
  }

  @Patch('lessons/:id/order')
  @UseGuards(JwtAuthGuard)
  async reorderLesson(@Param('id') id: string, @Body() dto: LessonOrderDto, @Request() req) {
    return this.lessonsService.reorderLesson(id, dto.order);
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard)
  async deleteLesson(@Param('id') id: string, @Request() req) {
    await this.lessonsService.delete(id, req.user.id);
    return { success: true };
  }

  @Post('lessons/:id/upload-url')
  @UseGuards(JwtAuthGuard)
  async getUploadUrl(@Param('id') id: string, @Request() req) {
    return this.lessonsService.getUploadUrl(id, req.user.id);
  }

  @Post('enrollments')
  @UseGuards(JwtAuthGuard)
  async enroll(@Body() body: { courseId: string }, @Request() req) {
    return this.enrollmentsService.enroll(req.user.id, body.courseId);
  }

  @Get('enrollments/my')
  @UseGuards(JwtAuthGuard)
  async myEnrollments(@Request() req) {
    return this.enrollmentsService.findMyEnrollments(req.user.id);
  }

  @Get('enrollments/:id')
  @UseGuards(JwtAuthGuard)
  async getEnrollment(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.findOne(id, req.user.id);
  }

  @Delete('enrollments/:id')
  @UseGuards(JwtAuthGuard)
  async unenroll(@Param('id') id: string, @Request() req) {
    await this.enrollmentsService.unenroll(id, req.user.id);
    return { success: true };
  }

  @Post('enrollments/:id/progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(@Param('id') id: string, @Body() dto: UpdateProgressDto, @Request() req) {
    return this.enrollmentsService.updateProgress(id, req.user.id, dto);
  }

  @Get('enrollments/:id/progress')
  @UseGuards(JwtAuthGuard)
  async getProgress(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.getProgress(id, req.user.id);
  }

  @Post('enrollments/:id/certificate')
  @UseGuards(JwtAuthGuard)
  async generateCertificate(@Param('id') id: string, @Request() req) {
    return this.certificateService.generate(id, req.user.id);
  }

  @Get('certificates/:id')
  @UseGuards(JwtAuthGuard)
  async getCertificate(@Param('id') id: string, @Request() req) {
    const url = await this.certificateService.getCertificate(id, req.user.id);
    return { certificateUrl: url };
  }
}
