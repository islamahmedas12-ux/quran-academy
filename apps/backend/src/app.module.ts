import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './shared/interceptors/logger.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ClassesModule } from './modules/classes/classes.module';
import { QuranModule } from './modules/quran/quran.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StudentsModule } from './modules/students/students.module';
import { HealthController } from './health.controller';
import { SubscriptionTier } from './modules/payments/entities/subscription-tier.entity';
import { OrganizationSubscription } from './modules/payments/entities/organization-subscription.entity';
import { TeacherEarning } from './modules/payments/entities/teacher-earning.entity';
import { PaymentTransaction } from './modules/payments/entities/payment-transaction.entity';
import { Course } from './modules/courses/entities/course.entity';
import { Lesson } from './modules/courses/entities/lesson.entity';
import { Enrollment } from './modules/courses/entities/enrollment.entity';
import { LessonProgress } from './modules/courses/entities/lesson-progress.entity';
import { Certificate } from './modules/courses/entities/certificate.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: {
        PORT: Number,
        NODE_ENV: String,
        DATABASE_URL: String,
        REDIS_URL: String,
        JWT_SECRET: String,
        JWT_REFRESH_SECRET: String,
        FRONTEND_URL: String,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        migrations: ['dist/database/migrations/*.js'],
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CoursesModule,
    PaymentsModule,
    ClassesModule,
    QuranModule,
    TeachersModule,
    StudentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
