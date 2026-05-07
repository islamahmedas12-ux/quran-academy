import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClassesController,
  TeachersController,
  WebhooksController,
} from './classes.controller';
import { ClassesService } from './services/classes.service';
import { AvailabilityService } from './services/availability.service';
import { JitsiService } from './services/jitsi.service';
import { MinioService } from './services/minio.service';
import { EmailService } from './services/email.service';
import { ScheduledClass } from './entities/scheduled-class.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledClass, AvailabilitySlot])],
  controllers: [ClassesController, TeachersController, WebhooksController],
  providers: [
    ClassesService,
    AvailabilityService,
    JitsiService,
    MinioService,
    EmailService,
  ],
  exports: [ClassesService, AvailabilityService, JitsiService, MinioService],
})
export class ClassesModule {}
