import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/services/redis.service';

interface QuranVerse {
  number: number;
  surah: number;
  ayah: number;
  text: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

@Injectable()
export class QuranService {
  private readonly logger = new Logger(QuranService.name);
  private readonly AL_QURAN_API = 'https://api.alquran.cloud/v1';
  private readonly EVERYAYAH_API = 'https://everyayah.com/data';

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async getSurahs(): Promise<Surah[]> {
    const cacheKey = 'quran:surahs';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(`${this.AL_QURAN_API}/surah`);
      const data = await response.json();

      if (data.code === 200 && data.data) {
        const surahs = data.data.map((s: any) => ({
          number: s.number,
          name: s.name,
          englishName: s.englishName,
          englishNameTranslation: s.englishNameTranslation,
          numberOfAyahs: s.numberOfAyahs,
          revelationType: s.revelationType,
        }));

        await this.redisService.set(cacheKey, JSON.stringify(surahs), 604800);
        return surahs;
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to fetch surahs', error);
      return [];
    }
  }

  async getVerse(surah: number, ayah: number): Promise<QuranVerse | null> {
    const cacheKey = `quran:verse:${surah}:${ayah}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(`${this.AL_QURAN_API}/verse/${surah}:${ayah}`);
      const data = await response.json();

      if (data.code === 200 && data.data) {
        const verse: QuranVerse = {
          number: data.data.number,
          surah: data.data.surah.number,
          ayah: data.data.numberInSurah,
          text: data.data.text,
          transliteration: this.transliterate(data.data.text),
          translation: data.data.translation?.text || '',
          audioUrl: this.getAudioUrl(surah, ayah),
        };

        await this.redisService.set(cacheKey, JSON.stringify(verse), 604800);
        return verse;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to fetch verse ${surah}:${ayah}`, error);
      return null;
    }
  }

  async getSurah(surah: number, page: number = 1, limit: number = 50): Promise<{
    verses: QuranVerse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const cacheKey = `quran:surah:${surah}:${page}:${limit}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(`${this.AL_QURAN_API}/surah/${surah}`);
      const data = await response.json();

      if (data.code === 200 && data.data) {
        const allVerses = data.data.ayahs.map((ayah: any) => ({
          number: ayah.number,
          surah: data.data.number,
          ayah: ayah.numberInSurah,
          text: ayah.text,
          transliteration: this.transliterate(ayah.text),
          translation: ayah.translation?.text || '',
          audioUrl: this.getAudioUrl(data.data.number, ayah.numberInSurah),
        }));

        const start = (page - 1) * limit;
        const end = start + limit;
        const verses = allVerses.slice(start, end);

        const result = {
          verses,
          total: allVerses.length,
          page,
          totalPages: Math.ceil(allVerses.length / limit),
        };

        await this.redisService.set(cacheKey, JSON.stringify(result), 604800);
        return result;
      }

      return { verses: [], total: 0, page: 1, totalPages: 0 };
    } catch (error) {
      this.logger.error(`Failed to fetch surah ${surah}`, error);
      return { verses: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async getAudioUrl(surah: number, ayah: number): Promise<string> {
    const paddedSurah = surah.toString().padStart(3, '0');
    const paddedAyah = ayah.toString().padStart(3, '0');
    return `${this.EVERYAYAH_API}/0757_001.mp3`;
  }

  private transliterate(arabicText: string): string {
    const arabicToLatin: Record<string, string> = {
      ا: 'a',
      ب: 'b',
      ت: 't',
      ث: 'th',
      ج: 'j',
      ح: 'h',
      خ: 'kh',
      د: 'd',
      ذ: 'dh',
      ر: 'r',
      ز: 'z',
      س: 's',
      ش: 'sh',
      ص: 's',
      ض: 'd',
      ط: 't',
      ظ: 'z',
      ع: 'a',
      غ: 'gh',
      ف: 'f',
      ق: 'q',
      ك: 'k',
      ل: 'l',
      م: 'm',
      ن: 'n',
      ه: 'h',
      و: 'w',
      ي: 'y',
      ' ': ' ',
    };

    return arabicText
      .split('')
      .map((char) => arabicToLatin[char] || char)
      .join('');
  }
}
