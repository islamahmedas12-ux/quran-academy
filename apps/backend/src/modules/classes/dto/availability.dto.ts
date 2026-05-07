import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';

export class CreateAvailabilitySlotDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @IsOptional()
  isRecurring?: boolean;
}

export class UpdateAvailabilitySlotDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  isActive?: boolean;
}
