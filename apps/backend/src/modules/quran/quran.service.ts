import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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

const MAX_AYAH_BY_SURAH: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 38, 89: 46, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6,
};

@Injectable()
export class QuranService {
  private readonly logger = new Logger(QuranService.name);
  private readonly AL_QURAN_API = 'https://api.alquran.cloud/v1';
  private readonly EVERYAYAH_API = 'https://everyayah.com/data';
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private validateSurahAyah(surah: number, ayah?: number): void {
    if (surah < 1 || surah > 114) {
      throw new BadRequestException('Surah must be between 1 and 114');
    }
    if (ayah !== undefined) {
      const maxAyah = MAX_AYAH_BY_SURAH[surah] || 286;
      if (ayah < 1 || ayah > maxAyah) {
        throw new BadRequestException(`Ayah must be between 1 and ${maxAyah} for surah ${surah}`);
      }
    }
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.code === 200) {
          return data as T;
        }
        lastError = new Error(`API returned code ${data.code}`);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt}/${this.MAX_RETRIES} failed: ${lastError.message}`);
        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        }
      }
    }
    throw lastError || new Error('Failed to fetch after retries');
  }

  async getSurahs(): Promise<Surah[]> {
    const cacheKey = 'quran:surahs';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const data = await this.fetchWithRetry<any>(`${this.AL_QURAN_API}/surah`);
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
    } catch (error) {
      this.logger.error('Failed to fetch surahs', error);
      return [];
    }
  }

  async getVerse(surah: number, ayah: number): Promise<QuranVerse | null> {
    this.validateSurahAyah(surah, ayah);
    const cacheKey = `quran:verse:${surah}:${ayah}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const data = await this.fetchWithRetry<any>(`${this.AL_QURAN_API}/verse/${surah}:${ayah}`);
      const verse: QuranVerse = {
        number: data.data.number,
        surah: data.data.surah.number,
        ayah: data.data.numberInSurah,
        text: data.data.text,
        transliteration: this.transliterate(data.data.text),
        translation: data.data.translation?.text || '',
        audioUrl: this.getAudioUrl(data.data.surah.number, data.data.numberInSurah),
      };

      await this.redisService.set(cacheKey, JSON.stringify(verse), 604800);
      return verse;
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
    this.validateSurahAyah(surah);
    const cacheKey = `quran:surah:${surah}:${page}:${limit}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const data = await this.fetchWithRetry<any>(`${this.AL_QURAN_API}/surah/${surah}`);
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
    } catch (error) {
      this.logger.error(`Failed to fetch surah ${surah}`, error);
      return { verses: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async getAudioUrl(surah: number, ayah: number = 1): Promise<string> {
    this.validateSurahAyah(surah, ayah);
    const paddedSurah = surah.toString().padStart(3, '0');
    const paddedAyah = ayah.toString().padStart(3, '0');
    return `${this.EVERYAYAH_API}/${paddedSurah}${paddedAyah}.mp3`;
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
