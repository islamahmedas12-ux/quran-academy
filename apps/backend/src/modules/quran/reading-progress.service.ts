import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProgress } from './entities/student-progress.entity';
import {
  ReadingProgressDto,
  StudentProgressSummary,
} from './interfaces/quran.interfaces';
import { RedisService } from '../../shared/services/redis.service';

const PROGRESS_CACHE_TTL = 60 * 30;

@Injectable()
export class ReadingProgressService {
  private readonly logger = new Logger(ReadingProgressService.name);

  constructor(
    @InjectRepository(StudentProgress)
    private readonly progressRepository: Repository<StudentProgress>,
    private readonly redisService: RedisService,
  ) {}

  async saveProgress(
    studentId: string,
    dto: ReadingProgressDto,
  ): Promise<void> {
    const cacheKey = `quran:progress:${studentId}:${dto.surah}`;

    let progress = await this.progressRepository.findOne({
      where: { studentId, surah: dto.surah },
    });

    if (progress) {
      progress.ayah = dto.ayah;
      progress.timeSpent += dto.timeSpent;
    } else {
      progress = this.progressRepository.create({
        studentId,
        surah: dto.surah,
        ayah: dto.ayah,
        timeSpent: dto.timeSpent,
      });
    }

    await this.progressRepository.save(progress);
    await this.redisService.del(cacheKey);
  }

  async getProgress(
    studentId: string,
    page = 1,
    limit = 50,
  ): Promise<StudentProgress[]> {
    const cacheKey = `quran:progress:${studentId}:page:${page}:limit:${limit}`;
    const cached = await this.redisService.get<StudentProgress[]>(cacheKey);
    if (cached) return cached;

    const [progress, total] = await this.progressRepository.findAndCount({
      where: { studentId },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    await this.redisService.set(cacheKey, progress, PROGRESS_CACHE_TTL);
    return progress;
  }

  async getLastReadPosition(
    studentId: string,
    surah: number,
  ): Promise<StudentProgress | null> {
    const cacheKey = `quran:progress:${studentId}:${surah}`;
    const cached = await this.redisService.get<StudentProgress>(cacheKey);
    if (cached) return cached;

    const progress = await this.progressRepository.findOne({
      where: { studentId, surah },
      order: { updatedAt: 'DESC' },
    });

    if (progress) {
      await this.redisService.set(cacheKey, progress, PROGRESS_CACHE_TTL);
    }
    return progress;
  }

  async getProgressSummary(
    studentId: string,
  ): Promise<StudentProgressSummary[]> {
    const results = await this.progressRepository
      .createQueryBuilder('progress')
      .select('progress.surah', 'surah')
      .addSelect('progress.ayah', 'ayah')
      .addSelect('MAX(progress.updatedAt)', 'lastReadAt')
      .where('progress.studentId = :studentId', { studentId })
      .groupBy('progress.surah')
      .addGroupBy('progress.ayah')
      .getRawMany();

    return results.map((r) => ({
      surah: r.surah,
      ayah: r.ayah,
      lastReadAt: new Date(r.lastReadAt),
    }));
  }
}
