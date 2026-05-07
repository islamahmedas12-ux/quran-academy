import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
  async getVerse(@Param('surah') surah: string, @Param('ayah') ayah: string) {
    return this.quranService.getVerse(parseInt(surah), parseInt(ayah));
  }

  @Get('surah/:surah')
  async getSurah(
    @Param('surah') surah: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.quranService.getSurah(parseInt(surah), parseInt(page), parseInt(limit));
  }

  @Get('surah/:surah/audio')
  async getSurahAudio(@Param('surah') surah: string, @Query('ayah') ayah?: string) {
    const audioUrl = this.quranService.getAudioUrl(parseInt(surah), ayah ? parseInt(ayah) : 1);
    return { audioUrl };
  }
}
