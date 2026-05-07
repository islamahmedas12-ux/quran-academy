import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { id: string; [key: string]: any };
}

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async getStudents(@Query('organizationId') organizationId?: string) {
    return this.studentsService.findAll(organizationId);
  }

  @Get('me')
  async getMyProfile(@Request() req: RequestWithUser) {
    return this.studentsService.findById(req.user.id);
  }

  @Get(':id')
  async getStudent(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Get(':id/parent')
  async getStudentByParent(@Request() req: RequestWithUser) {
    return this.studentsService.findByParent(req.user.id);
  }

  @Post(':id/link-parent')
  async linkToParent(
    @Param('id') id: string,
    @Body() body: { parentId: string },
    @Request() req: RequestWithUser,
  ) {
    return this.studentsService.linkToParent(id, body.parentId);
  }

  @Get(':id/enrollments')
  async getStudentEnrollments(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.studentsService.getEnrollments(id);
  }

  @Get(':id/classes')
  async getStudentClasses(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.studentsService.getClasses(id);
  }

  @Get(':id/progress')
  async getStudentProgress(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.studentsService.getProgress(id);
  }
}
