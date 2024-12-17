import { CategoryService } from './category.service';
import { createTestingModule } from '../../test/test-utils';
import { MockContext } from '../../database/database.service.test';
import { CATEGORIES } from './category.config';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockContext: MockContext;

  beforeEach(async () => {
    const { module, mockContext: mc } = await createTestingModule([
      CategoryService,
    ]);
    service = module.get<CategoryService>(CategoryService);
    mockContext = mc;
  });

  describe('initialization', () => {
    it('should sync categories on module init', async () => {
      // Arrange
      mockContext.prisma.category.findMany.mockResolvedValue([]);
      mockContext.prisma.category.createMany.mockResolvedValue({ count: 2 });

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockContext.prisma.category.createMany).toHaveBeenCalledWith({
        data: CATEGORIES,
      });
    });

    it('should not duplicate existing categories', async () => {
      // Arrange
      const existingCategories = [
        {
          id: 'cat1',
          name: 'cabin',
          description: 'Cozy cabin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockContext.prisma.category.findMany.mockResolvedValue(
        existingCategories,
      );

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockContext.prisma.category.createMany).toHaveBeenCalledWith({
        data: CATEGORIES.filter((c) => c.name !== 'cabin'),
      });
    });
  });

  describe('findMany', () => {
    it('should return categories with pagination', async () => {
      // Arrange
      const mockCategories = [
        {
          id: 'cat1',
          name: 'cabin',
          description: 'Cozy cabin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockContext.prisma.category.findMany.mockResolvedValue(mockCategories);

      // Act
      const result = await service.findMany({ skip: 0, take: 10 });

      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockContext.prisma.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      mockContext.prisma.category.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findMany({ skip: 0, take: 10 });

      // Assert
      expect(result).toEqual([]);
    });
  });
});
