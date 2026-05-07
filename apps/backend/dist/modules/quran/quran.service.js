"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuranService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../shared/services/redis.service");
const AL_QURAN_CLOUD_BASE = 'https://api.alquran.cloud/v1';
const EVERYAYAH_BASE = 'https://everyayah.com/data';
const RECITER_FOLDER = {
    Alafasy: 'Alafasy_128kbps',
    AbdulBaset: 'AbdulBaset_128kbps',
    AlSudais: 'AlSudais_128kbps',
    AlShuraym: 'AlShuraym_128kbps',
    AlMuaiqly: 'AlMuaiqly_128kbps',
};
const TRANSLITERATION_CACHE_TTL = 60 * 60 * 24 * 7;
const VERSE_CACHE_TTL = 60 * 60 * 24 * 7;
const SURAH_CACHE_TTL = 60 * 60 * 24;
let QuranService = QuranService_1 = class QuranService {
    configService;
    redisService;
    logger = new common_1.Logger(QuranService_1.name);
    constructor(configService, redisService) {
        this.configService = configService;
        this.redisService = redisService;
    }
    async getSurahs() {
        const cacheKey = 'quran:surahs';
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await fetch(`${AL_QURAN_CLOUD_BASE}/surah`);
            if (!response.ok)
                throw new Error(`API responded ${response.status}`);
            const data = await response.json();
            await this.redisService.set(cacheKey, data.data, SURAH_CACHE_TTL);
            return data.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch surahs from API: ${error}`);
            return this.getLocalSurahs();
        }
    }
    async getVerse(surah, ayah) {
        const cacheKey = `quran:verse:${surah}:${ayah}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        try {
            const [verseResponse, transliterationResponse] = await Promise.all([
                fetch(`${AL_QURAN_CLOUD_BASE}/ayah/${surah}:${ayah}`),
                fetch(`${AL_QURAN_CLOUD_BASE}/ayah/${surah}:${ayah}/transliteration.ar`),
            ]);
            if (!verseResponse.ok)
                throw new Error(`Verse API responded ${verseResponse.status}`);
            const verseData = await verseResponse.json();
            let transliteration = '';
            if (transliterationResponse.ok) {
                const translitData = await transliterationResponse.json();
                transliteration = translitData.data.map((v) => v.text).join(' ');
            }
            else {
                transliteration = await this.transliterate(verseData.data.text);
            }
            const translations = {};
            for (const translation of verseData.data.translations) {
                const lang = translation.languageName.toLowerCase();
                if (['english', 'urdu', 'indonesian', 'french', 'spanish', 'german'].includes(lang)) {
                    const langCode = lang === 'english' ? 'en' : lang === 'indonesian' ? 'id' : lang.slice(0, 2);
                    translations[langCode] = translation.text;
                }
            }
            const verse = {
                surah: verseData.data.surah.number,
                ayah: verseData.data.numberInSurah,
                arabicText: verseData.data.text,
                transliteration,
                translations,
                audioUrl: this.buildAudioUrl(surah, ayah),
            };
            await this.redisService.set(cacheKey, verse, VERSE_CACHE_TTL);
            return verse;
        }
        catch (error) {
            this.logger.error(`Failed to fetch verse ${surah}:${ayah}: ${error}`);
            return this.getLocalVerse(surah, ayah);
        }
    }
    async transliterate(arabicText) {
        const cacheKey = `quran:translit:${Buffer.from(arabicText).toString('base64').slice(0, 32)}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await fetch('https://api.alquran.cloud/v1/ayah/' + encodeURIComponent(arabicText) + '/transliteration.ar');
            if (response.ok) {
                const data = await response.json();
                const transliterated = data.data.map((v) => v.text).join(' ');
                await this.redisService.set(cacheKey, transliterated, TRANSLITERATION_CACHE_TTL);
                return transliterated;
            }
        }
        catch {
        }
        return this.basicTransliterate(arabicText);
    }
    basicTransliterate(text) {
        const arabicToRoman = {
            'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
            'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': "'",
            'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
            'ي': 'y', 'ء': "'", 'ٱ': 'a', '۝': '',
        };
        return text.split('').map((char) => arabicToRoman[char] || char).join('');
    }
    buildAudioUrl(surah, ayah, reciter = 'Alafasy', quality = '128kbps') {
        const folder = RECITER_FOLDER[reciter].replace('128kbps', quality);
        const surahStr = surah.toString().padStart(3, '0');
        const ayahStr = ayah.toString().padStart(3, '0');
        return `${EVERYAYAH_BASE}/${folder}/${surahStr}${ayahStr}.mp3`;
    }
    async getSurahAudio(surah, reciter = 'Alafasy', quality = '128kbps') {
        const cacheKey = `quran:surah_audio:${surah}:${reciter}:${quality}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        const folder = RECITER_FOLDER[reciter].replace('128kbps', quality);
        const url = `${EVERYAYAH_BASE}/${folder}/${surah.toString().padStart(3, '0')}.mp3`;
        await this.redisService.set(cacheKey, url, SURAH_CACHE_TTL);
        return url;
    }
    async getSurah(surahNumber, page = 1, limit = 50) {
        const surahs = await this.getSurahs();
        const surah = surahs.find((s) => s.number === surahNumber);
        if (!surah)
            throw new Error(`Surah ${surahNumber} not found`);
        const totalVerses = surah.numberOfAyahs;
        const totalPages = Math.ceil(totalVerses / limit);
        const startAyah = (page - 1) * limit + 1;
        const endAyah = Math.min(page * limit, totalVerses);
        const verses = [];
        for (let ayah = startAyah; ayah <= endAyah; ayah++) {
            const verse = await this.getVerse(surahNumber, ayah);
            verses.push({
                ...verse,
                audioTimestamp: (ayah - 1) * 30,
            });
        }
        return {
            surah,
            verses,
            pagination: {
                page,
                limit,
                total: totalVerses,
                totalPages,
            },
        };
    }
    getLocalSurahs() {
        return [
            { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
            { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
        ];
    }
    async getLocalVerse(surah, ayah) {
        return {
            surah,
            ayah,
            arabicText: '',
            transliteration: '',
            translations: {},
            audioUrl: this.buildAudioUrl(surah, ayah),
        };
    }
};
exports.QuranService = QuranService;
exports.QuranService = QuranService = QuranService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_service_1.RedisService])
], QuranService);
//# sourceMappingURL=quran.service.js.map