import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ClassStatus } from '../entities/scheduled-class.entity';

export class BookClassDto {
  @IsUUID()
  teacherId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

export class UpdateClassDto {
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;
}

export class AddNotesDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  homeworkDescription?: string;

  @IsOptional()
  @IsString()
  homeworkUrl?: string;
}

export class AddFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class ClassQueryDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}
