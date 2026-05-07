import { IsInt, IsOptional, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Reciter, AudioQuality } from '../interfaces/quran.interfaces';

export class SurahParamsDto {
  @IsInt()
  @Min(1)
  @Max(114)
  surah: number;
}

export class VerseParamsDto {
  @IsInt()
  @Min(1)
  @Max(114)
  surah: number;

  @IsInt()
  @Min(1)
  @Max(286)
  ayah: number;
}

export class SurahQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 50;
}

export class AudioQueryDto {
  @IsOptional()
  @IsEnum(['Alafasy', 'AbdulBaset', 'AlSudais', 'AlShuraym', 'AlMuaiqly'])
  reciter?: Reciter = 'Alafasy';

  @IsOptional()
  @IsEnum(['64kbps', '128kbps', '192kbps'])
  quality?: AudioQuality = '128kbps';
}

export class ReadingProgressDto {
  @IsInt()
  @Min(1)
  @Max(114)
  surah: number;

  @IsInt()
  @Min(1)
  @Max(286)
  ayah: number;

  @IsInt()
  @Min(1)
  timeSpent: number;
}

export class ReadingProgressQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 50;
}
