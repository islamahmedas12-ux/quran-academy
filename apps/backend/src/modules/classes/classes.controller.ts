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
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassesService } from './services/classes.service';
import { AvailabilityService } from './services/availability.service';
import {
  BookClassDto,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  ClassNotesDto,
  ClassFeedbackDto,
  AvailabilityQueryDto,
} from './dtos/class.dtos';
import { Roles } from '../../shared/decorators';
import { Role } from '../../shared/constants/enums';

@Controller('classes')
@UseGuards(AuthGuard('jwt'))
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post('book')
  @Roles(Role.STUDENT)
  async bookClass(@Request() req: any, @Body() dto: BookClassDto) {
    const organizationId = req.user.organizationId;
    return this.classesService.bookClass(req.user.userId, organizationId, dto);
  }

  @Get('upcoming')
  async getUpcomingClasses(@Request() req: any, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.classesService.getUpcomingClasses(req.user.userId, daysNum);
  }

  @Get('history')
  async getClassHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.classesService.getClassHistory(
      req.user.userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('calendar.ics')
  async getCalendarFeed(@Request() req: any) {
    const ical = await this.classesService.generateIcalFeed(req.user.userId);
    return {
      content: ical,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="quran-classes.ics"',
      },
    };
  }

  @Get(':id')
  async getClass(@Param('id') id: string) {
    return this.classesService.getClassById(id);
  }

  @Post(':id/join')
  async joinClass(@Param('id') id: string, @Request() req: any) {
    return this.classesService.joinClass(id, req.user.userId, req.user.email);
  }

  @Post(':id/complete')
  @Roles(Role.TEACHER)
  async completeClass(@Param('id') id: string, @Request() req: any) {
    return this.classesService.completeClass(id, req.user.userId);
  }

  @Post(':id/cancel')
  async cancelClass(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason?: string,
  ) {
    return this.classesService.cancelClass(id, req.user.userId, reason);
  }

  @Post(':id/notes')
  @Roles(Role.TEACHER)
  async addNotes(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ClassNotesDto,
  ) {
    return this.classesService.addClassNotes(id, req.user.userId, dto);
  }

  @Post(':id/recording')
  async getRecording(@Param('id') id: string, @Request() req: any) {
    return this.classesService.getRecording(id, req.user.userId);
  }

  @Patch(':id/recording')
  @Roles(Role.TEACHER)
  async toggleRecording(
    @Param('id') id: string,
    @Request() req: any,
    @Body('enabled') enabled: boolean,
  ) {
    return this.classesService.toggleRecording(id, req.user.userId, enabled);
  }

  @Post(':id/feedback')
  async submitFeedback(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ClassFeedbackDto,
  ) {
    return this.classesService.submitFeedback(id, req.user.userId, dto);
  }

  @Post('room/:id')
  @Roles(Role.TEACHER, Role.STUDENT)
  async getJitsiRoom(@Param('id') id: string, @Request() req: any) {
    const cls = await this.classesService.getClassById(id);
    const isHost = cls.teacherId === req.user.userId;
    const result = this.classesService['jitsiService'].generateRoomAndToken({
      classId: id,
      userId: req.user.userId,
      userName: req.user.email,
      isHost,
    });
    return result;
  }
}

@Controller('teachers')
@UseGuards(AuthGuard('jwt'))
export class TeachersController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get(':teacherId/availability')
  async getTeacherAvailability(
    @Param('teacherId') teacherId: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.availabilityService.getTeacherAvailability(
      teacherId,
      query.fromDate,
      query.toDate,
    );
  }

  @Patch(':teacherId/availability')
  @Roles(Role.TEACHER)
  async updateAvailability(
    @Param('teacherId') teacherId: string,
    @Request() req: any,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    if (req.user.userId !== teacherId) {
      throw new ForbiddenException(
        'Cannot update another teachers availability',
      );
    }
    return this.availabilityService.upsertAvailability(teacherId, {
      dayOfWeek: dto.dayOfWeek!,
      startTime: dto.startTime!,
      endTime: dto.endTime!,
      isRecurring: dto.isRecurring,
      specificDate: dto.specificDate,
      isActive: dto.isActive,
    });
  }
}

@Controller('webhooks')
export class WebhooksController {
  @Post('google-calendar')
  async handleGoogleCalendarWebhook(@Body() body: any) {
    return { received: true };
  }
}
