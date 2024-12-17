import { AmenityService } from './amenity.service';
import { createTestingModule } from '../../test/test-utils';
import { MockContext } from '../../database/database.service.test';
import { AMENITIES } from './amenity.config';

describe('AmenityService', () => {
  let service: AmenityService;
  let mockContext: MockContext;

  beforeEach(async () => {
    const { module, mockContext: mc } = await createTestingModule([
      AmenityService,
    ]);
    service = module.get<AmenityService>(AmenityService);
    mockContext = mc;
  });

  describe('initialization', () => {
    it('should sync amenities on module init', async () => {
      // Arrange
      mockContext.prisma.amenity.findMany.mockResolvedValue([]);
      mockContext.prisma.amenity.createMany.mockResolvedValue({ count: 2 });

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockContext.prisma.amenity.createMany).toHaveBeenCalledWith({
        data: AMENITIES,
      });
    });

    it('should not duplicate existing amenities', async () => {
      // Arrange
      const existingAmenities = [
        {
          id: 'amen1',
          name: 'wifi',
          description: 'High-speed wifi',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockContext.prisma.amenity.findMany.mockResolvedValue(existingAmenities);

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockContext.prisma.amenity.createMany).toHaveBeenCalledWith({
        data: AMENITIES.filter((a) => a.name !== 'wifi'),
      });
    });
  });

  describe('findMany', () => {
    it('should return amenities with pagination', async () => {
      // Arrange
      const mockAmenities = [
        {
          id: 'amen1',
          name: 'wifi',
          description: 'High-speed wifi',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockContext.prisma.amenity.findMany.mockResolvedValue(mockAmenities);

      // Act
      const result = await service.findMany({ skip: 0, take: 10 });

      // Assert
      expect(result).toEqual(mockAmenities);
      expect(mockContext.prisma.amenity.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      mockContext.prisma.amenity.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findMany({ skip: 0, take: 10 });

      // Assert
      expect(result).toEqual([]);
    });
  });
});
