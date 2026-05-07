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
import { ClassesService } from './classes.service';
import {
  BookClassDto,
  UpdateClassDto,
  AddNotesDto,
  AddFeedbackDto,
  ClassQueryDto,
  CreateAvailabilitySlotDto,
  UpdateAvailabilitySlotDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { id: string; [key: string]: any };
}

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('book')
  async bookClass(@Body() dto: BookClassDto, @Request() req: RequestWithUser) {
    return this.classesService.bookClass(req.user.id, dto);
  }

  @Get('upcoming')
  async getUpcomingClasses(@Request() req: RequestWithUser) {
    return this.classesService.findUpcoming(req.user.id);
  }

  @Get('past')
  async getPastClasses(@Request() req: RequestWithUser) {
    return this.classesService.findPast(req.user.id);
  }

  @Get(':id')
  async getClass(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.classesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async updateClass(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.updateClass(id, req.user.id, dto);
  }

  @Post(':id/confirm')
  async confirmClass(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.classesService.confirmClass(id, req.user.id);
  }

  @Post(':id/cancel')
  async cancelClass(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.classesService.cancelClass(id, req.user.id);
  }

  @Post(':id/notes')
  async addNotes(
    @Param('id') id: string,
    @Body() dto: AddNotesDto,
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.addNotes(id, req.user.id, dto);
  }

  @Post(':id/feedback/teacher')
  async addTeacherFeedback(
    @Param('id') id: string,
    @Body() body: { rating: number } & AddFeedbackDto,
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.addTeacherFeedback(id, req.user.id, body.rating, body);
  }

  @Post(':id/feedback/student')
  async addStudentFeedback(
    @Param('id') id: string,
    @Body() body: { rating: number } & AddFeedbackDto,
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.addStudentFeedback(id, req.user.id, body.rating, body);
  }

  @Post(':id/complete')
  async completeClass(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.classesService.completeClass(id, req.user.id);
  }

  @Get('availability/:teacherId')
  async getTeacherAvailability(@Param('teacherId') teacherId: string) {
    return this.classesService.getAvailability(teacherId);
  }

  @Post('availability')
  async setAvailability(
    @Body() body: { slots: Partial<AvailabilitySlot>[] },
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.setAvailability(req.user.id, body.slots);
  }

  @Post('availability/slots')
  async addAvailabilitySlot(
    @Body() dto: CreateAvailabilitySlotDto,
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.addAvailabilitySlot(req.user.id, dto);
  }

  @Patch('availability/slots/:id')
  async updateAvailabilitySlot(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilitySlotDto,
    @Request() req: RequestWithUser,
  ) {
    return this.classesService.updateAvailabilitySlot(id, req.user.id, dto);
  }

  @Delete('availability/slots/:id')
  async deleteAvailabilitySlot(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.classesService.deleteAvailabilitySlot(id, req.user.id);
    return { success: true };
  }
}
