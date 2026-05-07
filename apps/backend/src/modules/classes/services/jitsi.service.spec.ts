import { Test, TestingModule } from '@nestjs/testing';
import { JitsiService } from './jitsi.service';
import { ConfigService } from '@nestjs/config';

describe('JitsiService', () => {
  let service: JitsiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JitsiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                JITSI_DOMAIN: 'meet.jit.si',
                JITSI_APP_ID: 'quran-academy',
                JITSI_SECRET: 'test-secret-key',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<JitsiService>(JitsiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRoomName', () => {
    it('should generate room name with correct format', () => {
      const classId = 'test-class-123';
      const roomName = service.generateRoomName(classId);
      expect(roomName).toMatch(/^quran-class-test-class-123-\d+$/);
    });
  });

  describe('generateRoomAndToken', () => {
    it('should return roomName, token, and jitsiUrl', () => {
      const result = service.generateRoomAndToken({
        classId: 'class-123',
        userId: 'user-123',
        userName: 'Test User',
        isHost: true,
      });

      expect(result).toHaveProperty('roomName');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('jitsiUrl');
      expect(result.roomName).toContain('quran-class-class-123');
      expect(result.jitsiUrl).toContain('meet.jit.si');
    });
  });

  describe('getJitsiUrl', () => {
    it('should return correct Jitsi URL', () => {
      const url = service.getJitsiUrl('test-room');
      expect(url).toBe('https://meet.jit.si/test-room');
    });
  });
});
