import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { MagicLinkToken } from './entities/magic-link-token.entity';
import { RedisService } from '../../shared/services/redis.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MagicLinkToken)
    private readonly magicLinkRepository: Repository<MagicLinkToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async generateMagicLink(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('User account is inactive');
    }

    await this.magicLinkRepository.delete({ userId: user.id });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const magicLink = this.magicLinkRepository.create({
      token,
      userId: user.id,
      expiresAt,
    });

    await this.magicLinkRepository.save(magicLink);
  }

  async verifyMagicLink(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  }> {
    const magicLink = await this.magicLinkRepository.findOne({ where: { token } });

    if (!magicLink) {
      throw new BadRequestException('Invalid magic link token');
    }

    if (magicLink.expiresAt < new Date()) {
      throw new BadRequestException('Magic link has expired');
    }

    const user = await this.userRepository.findOne({ where: { id: magicLink.userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('User account is inactive');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    await this.redisService.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    await this.magicLinkRepository.delete({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      user,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const storedToken = await this.redisService.get(`refresh:${user.id}`);
      if (storedToken !== refreshToken) {
        throw new BadRequestException('Token has been revoked');
      }

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '15m' },
      );

      return { accessToken, expiresIn: 15 * 60 };
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redisService.set(`blacklist:${token}`, '1', ttl);
      }
      await this.redisService.del(`refresh:${payload.sub}`);
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
