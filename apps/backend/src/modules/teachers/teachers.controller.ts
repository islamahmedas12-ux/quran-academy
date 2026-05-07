import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  async getTeachers(
    @Query('specialty') specialty?: string,
    @Query('language') language?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.teachersService.findAll({ specialty, language, organizationId });
  }

  @Get(':id')
  async getTeacher(@Param('id') id: string) {
    return this.teachersService.findById(id);
  }

  @Get(':id/availability')
  async getTeacherAvailability(@Param('id') id: string) {
    return this.teachersService.getAvailability(id);
  }

  @Get(':id/stats')
  async getTeacherStats(@Param('id') id: string) {
    return this.teachersService.getStats(id);
  }
}
