import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';
import { MagicLinkToken } from './entities/magic-link-token.entity';
import { RedisService } from '../../shared/services/redis.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let magicLinkRepository: jest.Mocked<Repository<MagicLinkToken>>;
  let redisService: jest.Mocked<RedisService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.STUDENT,
    organizationId: 'org-1',
    isActive: true,
  };

  const mockMagicLinkToken: Partial<MagicLinkToken> = {
    id: 'token-1',
    token: 'valid-token',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 3600000),
  };

  beforeEach(async () => {
    const mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockMagicLinkRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(MagicLinkToken),
          useValue: mockMagicLinkRepo,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    magicLinkRepository = module.get(getRepositoryToken(MagicLinkToken));
    redisService = module.get(RedisService);
    jwtService = module.get(JwtService);
  });

  describe('generateMagicLink', () => {
    it('should generate magic link for existing user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      magicLinkRepository.create.mockReturnValue(mockMagicLinkToken as MagicLinkToken);
      magicLinkRepository.save.mockResolvedValue(mockMagicLinkToken as MagicLinkToken);

      const result = await service.generateMagicLink('test@example.com');

      expect(result).toHaveProperty('token');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.generateMagicLink('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should invalidate previous tokens for same user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      magicLinkRepository.create.mockReturnValue(mockMagicLinkToken as MagicLinkToken);
      magicLinkRepository.save.mockResolvedValue(mockMagicLinkToken as MagicLinkToken);
      magicLinkRepository.delete.mockResolvedValue(undefined);

      await service.generateMagicLink('test@example.com');

      expect(magicLinkRepository.delete).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });

  describe('verifyMagicLink', () => {
    it('should verify valid magic link and return tokens', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const validToken: Partial<MagicLinkToken> = {
        ...mockMagicLinkToken,
        expiresAt: futureDate,
      };

      magicLinkRepository.findOne.mockResolvedValue(validToken as MagicLinkToken);
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jwtService.sign.mockReturnValue('access-token');
      redisService.set.mockResolvedValue(undefined);
      magicLinkRepository.delete.mockResolvedValue(undefined);

      const result = await service.verifyMagicLink('valid-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(magicLinkRepository.delete).toHaveBeenCalled();
    });

    it('should throw BadRequestException for expired token', async () => {
      const expiredToken: Partial<MagicLinkToken> = {
        ...mockMagicLinkToken,
        expiresAt: new Date(Date.now() - 3600000),
      };

      magicLinkRepository.findOne.mockResolvedValue(expiredToken as MagicLinkToken);

      await expect(service.verifyMagicLink('expired-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid token', async () => {
      magicLinkRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyMagicLink('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', type: 'refresh' });
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should throw BadRequestException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-refresh token type', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', type: 'access' });

      await expect(service.refreshToken('access-token-misused')).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token in Redis', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      redisService.del.mockResolvedValue(undefined);

      await service.logout('valid-token');

      expect(redisService.del).toHaveBeenCalledWith('refresh:user-1');
    });

    it('should handle logout for non-existent token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.logout('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid userId', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.validateUser('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid userId', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('invalid-id');

      expect(result).toBeNull();
    });
  });
});
