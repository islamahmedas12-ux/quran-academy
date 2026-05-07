import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { QuranService } from './quran.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quran')
export class QuranController {
  constructor(private readonly quranService: QuranService) {}

  @Get('surahs')
  async getSurahs() {
    return this.quranService.getSurahs();
  }

  @Get('verse/:surah/:ayah')
  async getVerse(
    @Param('surah', new ParseIntPipe({ errorHttpStatusCode: 400 })) surah: number,
    @Param('ayah', new ParseIntPipe({ errorHttpStatusCode: 400 })) ayah: number,
  ) {
    return this.quranService.getVerse(surah, ayah);
  }

  @Get('surah/:surah')
  async getSurah(
    @Param('surah', new ParseIntPipe({ errorHttpStatusCode: 400 })) surah: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.quranService.getSurah(surah, parseInt(page), parseInt(limit));
  }

  @Get('surah/:surah/audio')
  async getSurahAudio(
    @Param('surah', new ParseIntPipe({ errorHttpStatusCode: 400 })) surah: number,
    @Query('ayah') ayah?: string,
  ) {
    return this.quranService.getAudioUrl(surah, ayah ? parseInt(ayah) : 1);
  }
}
