import { Repository } from 'typeorm';
import { StudentProgress } from './entities/student-progress.entity';
import { ReadingProgressDto, StudentProgressSummary } from './interfaces/quran.interfaces';
import { RedisService } from '../../shared/services/redis.service';
export declare class ReadingProgressService {
    private readonly progressRepository;
    private readonly redisService;
    private readonly logger;
    constructor(progressRepository: Repository<StudentProgress>, redisService: RedisService);
    saveProgress(studentId: string, dto: ReadingProgressDto): Promise<void>;
    getProgress(studentId: string, page?: number, limit?: number): Promise<StudentProgress[]>;
    getLastReadPosition(studentId: string, surah: number): Promise<StudentProgress | null>;
    getProgressSummary(studentId: string): Promise<StudentProgressSummary[]>;
}
