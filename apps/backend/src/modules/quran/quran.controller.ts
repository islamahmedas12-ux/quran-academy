import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuranService } from './quran.service';
import { ReadingProgressService } from './reading-progress.service';
import {
  SurahParamsDto,
  VerseParamsDto,
  SurahQueryDto,
  AudioQueryDto,
  ReadingProgressDto,
  ReadingProgressQueryDto,
} from './dto/quran.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import {
  Surah,
  SurahReaderResponse,
  Verse,
} from './interfaces/quran.interfaces';

@Controller('quran')
export class QuranController {
  constructor(
    private readonly quranService: QuranService,
    private readonly readingProgressService: ReadingProgressService,
  ) {}

  @Get('surahs')
  async getSurahs(): Promise<Surah[]> {
    return this.quranService.getSurahs();
  }

  @Get('verse/:surah/:ayah')
  async getVerse(@Param() params: VerseParamsDto): Promise<Verse> {
    return this.quranService.getVerse(params.surah, params.ayah);
  }

  @Get('surah/:surah')
  async getSurah(
    @Param() params: SurahParamsDto,
    @Query() query: SurahQueryDto,
  ): Promise<SurahReaderResponse> {
    return this.quranService.getSurah(
      params.surah,
      query.page ?? 1,
      query.limit ?? 50,
    );
  }

  @Get('surah/:surah/audio')
  async getSurahAudio(
    @Param() params: SurahParamsDto,
    @Query() query: AudioQueryDto,
  ): Promise<{ audioUrl: string }> {
    const audioUrl = await this.quranService.getSurahAudio(
      params.surah,
      query.reciter ?? 'Alafasy',
      query.quality ?? '128kbps',
    );
    return { audioUrl };
  }

  @Get('surah/:surah/:ayah/audio')
  async getVerseAudio(
    @Param() params: VerseParamsDto,
  ): Promise<{ audioUrl: string }> {
    const audioUrl = this.quranService.buildAudioUrl(params.surah, params.ayah);
    return { audioUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('progress')
  async saveProgress(
    @Body() body: ReadingProgressDto,
    @Req() req: any,
  ): Promise<{ success: boolean }> {
    await this.readingProgressService.saveProgress(req.user.userId, body);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('progress/:studentId')
  async getProgress(
    @Param('studentId') studentId: string,
    @Query() query: ReadingProgressQueryDto,
  ): Promise<{ progress: any[] }> {
    const progress = await this.readingProgressService.getProgress(
      studentId,
      query.page ?? 1,
      query.limit ?? 50,
    );
    return { progress };
  }
}
