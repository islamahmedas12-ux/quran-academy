import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { CourseCategory, CourseDifficulty } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CourseQueryDto {
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @IsOptional()
  @IsString()
  search?: string;
}
