import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService, LessonsService, EnrollmentsService, CertificateService } from './services';
import { Course, Lesson, Enrollment, LessonProgress, Certificate } from './entities';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, Enrollment, LessonProgress, Certificate]),
    AuthModule,
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationsModule),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, LessonsService, EnrollmentsService, CertificateService],
  exports: [CoursesService, LessonsService, EnrollmentsService],
})
export class CoursesModule {}
