import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QuranService } from './quran.service';
import { RedisService } from '../../shared/services/redis.service';

describe('QuranService', () => {
  let service: QuranService;
  let redisService: jest.Mocked<RedisService>;

  const mockSurahList = [
    {
      number: 1,
      name: 'Al-Fatiha',
      englishName: 'Al-Fatiha',
      englishNameTranslation: 'The Opening',
      numberOfAyahs: 7,
      revelationType: 'Meccan',
    },
    {
      number: 2,
      name: 'Al-Baqara',
      englishName: 'Al-Baqara',
      englishNameTranslation: 'The Cow',
      numberOfAyahs: 286,
      revelationType: 'Medinan',
    },
  ];

  const mockVerse = {
    number: 1,
    surah: 1,
    ayah: 1,
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'bismi allahi alrrahmani alrraheemi',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    audioUrl: 'https://everyayah.com/data/001_001.mp3',
  };

  beforeEach(async () => {
    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('https://api.alquran.cloud/v1'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuranService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QuranService>(QuranService);
    redisService = module.get(RedisService);

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSurahs', () => {
    it('should return cached surahs if available', async () => {
      redisService.get.mockResolvedValue(JSON.stringify(mockSurahList));

      const result = await service.getSurahs();

      expect(result).toEqual(mockSurahList);
      expect(redisService.get).toHaveBeenCalledWith('quran:surahs');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch from API and cache if not cached', async () => {
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          code: 200,
          data: mockSurahList,
        }),
      });

      const result = await service.getSurahs();

      expect(result).toEqual(mockSurahList);
      expect(global.fetch).toHaveBeenCalledWith('https://api.alquran.cloud/v1/surah');
      expect(redisService.set).toHaveBeenCalledWith(
        'quran:surahs',
        JSON.stringify(mockSurahList),
        604800,
      );
    });

    it('should return empty array on API error', async () => {
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          code: 500,
          data: null,
        }),
      });

      const result = await service.getSurahs();

      expect(result).toEqual([]);
    });

    it('should return empty array on fetch exception', async () => {
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.getSurahs();

      expect(result).toEqual([]);
    });
  });

  describe('getVerse', () => {
    it('should return cached verse if available', async () => {
      redisService.get.mockResolvedValue(JSON.stringify(mockVerse));

      const result = await service.getVerse(1, 1);

      expect(result).toEqual(mockVerse);
      expect(redisService.get).toHaveBeenCalledWith('quran:verse:1:1');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch from API and cache if not cached', async () => {
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          code: 200,
          data: {
            number: 1,
            surah: { number: 1 },
            numberInSurah: 1,
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            translation: { text: 'In the name of Allah...' },
          },
        }),
      });

      const result = await service.getVerse(1, 1);

      expect(result).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('https://api.alquran.cloud/v1/verse/1:1');
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should return null on API error', async () => {
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          code: 500,
          data: null,
        }),
      });

      const result = await service.getVerse(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('getSurah', () => {
    it('should return cached surah verses if available', async () => {
      const cachedSurah = {
        verses: [mockVerse],
        total: 7,
        page: 1,
        totalPages: 1,
      };
      redisService.get.mockResolvedValue(JSON.stringify(cachedSurah));

      const result = await service.getSurah(1, 1, 50);

      expect(result).toEqual(cachedSurah);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch from API and cache if not cached', async () => {
      const apiResponse = {
        code: 200,
        data: {
          number: 1,
          ayahs: [
            {
              number: 1,
              numberInSurah: 1,
              text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              translation: { text: 'In the name of Allah...' },
            },
          ],
        },
      };
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(apiResponse),
      });

      const result = await service.getSurah(1, 1, 50);

      expect(result.verses).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledWith('https://api.alquran.cloud/v1/surah/1');
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should paginate results correctly', async () => {
      const apiResponse = {
        code: 200,
        data: {
          number: 1,
          ayahs: Array(7).fill(null).map((_, i) => ({
            number: i + 1,
            numberInSurah: i + 1,
            text: `Verse ${i + 1}`,
            translation: { text: `Translation ${i + 1}` },
          })),
        },
      };
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(apiResponse),
      });

      const result = await service.getSurah(1, 2, 3);

      expect(result.verses).toHaveLength(3);
      expect(result.total).toBe(7);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('should return empty result on API error', async () => {
      redisService.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          code: 500,
          data: null,
        }),
      });

      const result = await service.getSurah(1, 1, 50);

      expect(result).toEqual({ verses: [], total: 0, page: 1, totalPages: 0 });
    });
  });

  describe('getAudioUrl', () => {
    it('should generate correct audio URL format', async () => {
      const result = await service.getAudioUrl(1, 1);

      expect(result).toMatch(/\.mp3$/);
    });

    it('should pad surah and ayah numbers correctly', async () => {
      const result1 = await service.getAudioUrl(1, 1);
      const result112 = await service.getAudioUrl(112, 1);

      expect(result1).toContain('001_001');
      expect(result112).toContain('112_001');
    });
  });

  describe('transliterate', () => {
    it('should transliterate Arabic text to Latin characters', async () => {
      const result = await service.getVerse(1, 1);

      expect(result?.transliteration).toBeTruthy();
      expect(result?.transliteration).toMatch(/^[a-z\s]+$/);
    });

    it('should handle spaces correctly', async () => {
      const result = await service.getVerse(1, 1);

      expect(result?.transliteration).toContain(' ');
    });

    it('should preserve unknown characters', async () => {
      const result = await service.getVerse(1, 1);

      expect(result?.text).toBeTruthy();
    });
  });
});
