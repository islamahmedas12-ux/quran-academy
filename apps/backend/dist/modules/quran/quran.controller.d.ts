import { QuranService } from './quran.service';
import { ReadingProgressService } from './reading-progress.service';
import { SurahParamsDto, VerseParamsDto, SurahQueryDto, AudioQueryDto, ReadingProgressDto, ReadingProgressQueryDto } from './dto/quran.dto';
import { Surah, SurahReaderResponse, Verse } from './interfaces/quran.interfaces';
export declare class QuranController {
    private readonly quranService;
    private readonly readingProgressService;
    constructor(quranService: QuranService, readingProgressService: ReadingProgressService);
    getSurahs(): Promise<Surah[]>;
    getVerse(params: VerseParamsDto): Promise<Verse>;
    getSurah(params: SurahParamsDto, query: SurahQueryDto): Promise<SurahReaderResponse>;
    getSurahAudio(params: SurahParamsDto, query: AudioQueryDto): Promise<{
        audioUrl: string;
    }>;
    getVerseAudio(params: VerseParamsDto): Promise<{
        audioUrl: string;
    }>;
    saveProgress(body: ReadingProgressDto, req: any): Promise<{
        success: boolean;
    }>;
    getProgress(studentId: string, query: ReadingProgressQueryDto): Promise<{
        progress: any[];
    }>;
}
