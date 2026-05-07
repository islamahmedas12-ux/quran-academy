import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { IsFutureDate } from '../../../shared/decorators';

export class BookClassDto {
  @IsNotEmpty()
  @IsString()
  teacherId: string;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  selectedSlot: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateAvailabilityDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ClassNotesDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  homeworkUrl?: string;

  @IsOptional()
  @IsString()
  homeworkDescription?: string;
}

export class ClassFeedbackDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class JoinClassResponseDto {
  roomName: string;
  token: string;
  jitsiUrl: string;
}

export class RecordingResponseDto {
  playbackUrl: string;
  expiresAt: Date;
}

export class AvailabilityQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
