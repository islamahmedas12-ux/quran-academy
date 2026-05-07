import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  lessonId: string;

  @IsOptional()
  @IsInt()
  watchedDuration?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
