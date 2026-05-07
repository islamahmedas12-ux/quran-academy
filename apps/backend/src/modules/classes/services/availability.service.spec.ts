import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityService } from './availability.service';
import { AvailabilitySlot } from '../entities/availability-slot.entity';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let repo: jest.Mocked<Repository<AvailabilitySlot>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(AvailabilitySlot),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    repo = module.get(getRepositoryToken(AvailabilitySlot));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeacherAvailability', () => {
    it('should return availability slots for a teacher', async () => {
      const mockSlots = [
        {
          id: 'slot-1',
          teacherId: 'teacher-1',
          dayOfWeek: 1,
          startTime: '09:00:00',
          endTime: '10:00:00',
          isRecurring: true,
          isActive: true,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockSlots);

      const result = await service.getTeacherAvailability('teacher-1');
      expect(result).toEqual(mockSlots);
    });
  });

  describe('checkSlotAvailable', () => {
    it('should return true when slot is available', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 'slot-1',
        teacherId: 'teacher-1',
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '10:00:00',
        isRecurring: true,
        isActive: true,
      });

      const tuesday = new Date('2026-05-12T09:30:00Z');
      const result = await service.checkSlotAvailable(
        'teacher-1',
        tuesday,
        new Date('2026-05-12T10:30:00Z'),
      );
      expect(result).toBe(true);
    });

    it('should return false when no slot exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const tuesday = new Date('2026-05-12T09:30:00Z');
      const result = await service.checkSlotAvailable(
        'teacher-1',
        tuesday,
        new Date('2026-05-12T10:30:00Z'),
      );
      expect(result).toBe(false);
    });
  });
});
