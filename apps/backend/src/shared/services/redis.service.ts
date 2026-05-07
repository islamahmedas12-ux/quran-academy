import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
    this.client.on('connect', () => this.logger.log('Connected to Redis'));
  }

  private prefixKey(orgId: string, key: string): string {
    return `${orgId}:${key}`;
  }

  async get(orgId: string, key: string): Promise<string | null> {
    return this.client.get(this.prefixKey(orgId, key));
  }

  async set(orgId: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    const prefixedKey = this.prefixKey(orgId, key);
    if (ttlSeconds) {
      await this.client.setex(prefixedKey, ttlSeconds, value);
    } else {
      await this.client.set(prefixedKey, value);
    }
  }

  async del(orgId: string, key: string): Promise<void> {
    await this.client.del(this.prefixKey(orgId, key));
  }

  async incr(orgId: string, key: string): Promise<number> {
    return this.client.incr(this.prefixKey(orgId, key));
  }

  async expire(orgId: string, key: string, seconds: number): Promise<void> {
    await this.client.expire(this.prefixKey(orgId, key), seconds);
  }
}
