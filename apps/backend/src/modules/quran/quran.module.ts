import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuranController } from './quran.controller';
import { QuranService } from './quran.service';
import { ReadingProgressService } from './reading-progress.service';
import { StudentProgress } from './entities/student-progress.entity';
import { RedisService } from '../../shared/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProgress])],
  controllers: [QuranController],
  providers: [QuranService, ReadingProgressService, RedisService],
  exports: [QuranService, ReadingProgressService],
})
export class QuranModule {}
