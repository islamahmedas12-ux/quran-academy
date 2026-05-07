import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../shared/services/redis.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let redisService: RedisService;

  const mockRedisService = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    setExpire: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-jwt-token'),
    verify: jest
      .fn()
      .mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
    decode: jest
      .fn()
      .mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        FRONTEND_URL: 'http://localhost:3000',
        EMAIL_FROM: 'noreply@example.com',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMagicLink', () => {
    it('should generate a magic link token and store in Redis', async () => {
      const email = 'student@example.com';
      const organizationId = 'org-123';

      const result = await authService.generateMagicLink(email, organizationId);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresIn');
      expect(typeof result.token).toBe('string');
      expect(result.expiresIn).toBe(900);
    });

    it('should store token in Redis with correct expiration', async () => {
      const email = 'teacher@example.com';
      const organizationId = 'org-456';

      await authService.generateMagicLink(email, organizationId);

      expect(mockRedisService.set).toHaveBeenCalled();
      expect(mockRedisService.setExpire).toHaveBeenCalledWith(
        expect.any(String),
        900,
      );
    });
  });

  describe('verifyMagicLink', () => {
    it('should return user data for valid token', async () => {
      const token = 'valid-token';
      mockRedisService.get.mockResolvedValue(
        JSON.stringify({
          email: 'test@example.com',
          organizationId: 'org-123',
          userId: 'user-123',
        }),
      );

      const result = await authService.verifyMagicLink(token);

      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('organizationId');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error for expired or invalid token', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await expect(
        authService.verifyMagicLink('invalid-token'),
      ).rejects.toThrow('Invalid or expired magic link');
    });
  });

  describe('refreshTokens', () => {
    it('should generate new access and refresh tokens', async () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const organizationId = 'org-123';

      const result = await authService.refreshTokens(
        userId,
        email,
        organizationId,
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should use correct expiration for tokens', async () => {
      const userId = 'user-456';
      const email = 'teacher@example.com';
      const organizationId = 'org-789';

      const result = await authService.refreshTokens(
        userId,
        email,
        organizationId,
      );

      expect(result.expiresIn).toBe(900);
    });
  });

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      const userId = 'user-123';
      const refreshToken = 'refresh-token-123';

      await authService.logout(userId, refreshToken);

      expect(mockRedisService.del).toHaveBeenCalledWith(
        `refresh:${userId}:${refreshToken}`,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user payload for valid JWT', async () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };

      const result = await authService.validateUser(payload);

      expect(result).toEqual(payload);
    });

    it('should return null for invalid payload', async () => {
      const payload = { sub: '', email: '' };

      const result = await authService.validateUser(payload);

      expect(result).toBeNull();
    });
  });
});
