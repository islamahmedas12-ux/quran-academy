import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/services/redis.service';
import { Surah, Verse, Reciter, AudioQuality, SurahReaderResponse } from './interfaces/quran.interfaces';
export declare class QuranService {
    private readonly configService;
    private readonly redisService;
    private readonly logger;
    constructor(configService: ConfigService, redisService: RedisService);
    getSurahs(): Promise<Surah[]>;
    getVerse(surah: number, ayah: number): Promise<Verse>;
    transliterate(arabicText: string): Promise<string>;
    private basicTransliterate;
    buildAudioUrl(surah: number, ayah: number, reciter?: Reciter, quality?: AudioQuality): string;
    getSurahAudio(surah: number, reciter?: Reciter, quality?: AudioQuality): Promise<string>;
    getSurah(surahNumber: number, page?: number, limit?: number): Promise<SurahReaderResponse>;
    private getLocalSurahs;
    private getLocalVerse;
}
