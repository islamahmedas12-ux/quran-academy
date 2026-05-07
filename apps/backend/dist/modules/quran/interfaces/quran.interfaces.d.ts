export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
}
export interface Verse {
    surah: number;
    ayah: number;
    arabicText: string;
    transliteration: string;
    translations: {
        en?: string;
        ur?: string;
        id?: string;
        fr?: string;
        es?: string;
        de?: string;
    };
    audioUrl: string;
}
export interface VerseWithAudio extends Verse {
    audioTimestamp?: number;
}
export interface SurahReaderResponse {
    surah: Surah;
    verses: VerseWithAudio[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ReadingProgress {
    id: string;
    studentId: string;
    surah: number;
    ayah: number;
    timeSpent: number;
    updatedAt: Date;
}
export interface ReadingProgressDto {
    surah: number;
    ayah: number;
    timeSpent: number;
}
export interface StudentProgressSummary {
    surah: number;
    ayah: number;
    lastReadAt: Date;
}
export type Reciter = 'Alafasy' | 'AbdulBaset' | 'AlSudais' | 'AlShuraym' | 'AlMuaiqly';
export type AudioQuality = '64kbps' | '128kbps' | '192kbps';
