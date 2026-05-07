import { Reciter, AudioQuality } from '../interfaces/quran.interfaces';
export declare class SurahParamsDto {
    surah: number;
}
export declare class VerseParamsDto {
    surah: number;
    ayah: number;
}
export declare class SurahQueryDto {
    page?: number;
    limit?: number;
}
export declare class AudioQueryDto {
    reciter?: Reciter;
    quality?: AudioQuality;
}
export declare class ReadingProgressDto {
    surah: number;
    ayah: number;
    timeSpent: number;
}
export declare class ReadingProgressQueryDto {
    page?: number;
    limit?: number;
}
