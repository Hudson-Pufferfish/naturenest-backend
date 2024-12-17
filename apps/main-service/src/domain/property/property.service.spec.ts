import { PropertyService } from './property.service';
import { createTestingModule } from '../../test/test-utils';
import { MockContext } from '../../database/database.service.test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Amenity } from '@prisma/client';

describe('PropertyService', () => {
  let service: PropertyService;
  let mockContext: MockContext;

  beforeEach(async () => {
    const { module, mockContext: mc } = await createTestingModule([
      PropertyService,
    ]);
    service = module.get<PropertyService>(PropertyService);
    mockContext = mc;
  });

  describe('create', () => {
    it('should create a property with valid data', async () => {
      // Arrange
      const mockCategory = {
        id: 'cat1',
        name: 'cabin',
        description: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProperty = {
        id: 'prop1',
        name: 'Test Property',
        tagLine: 'Test tagline',
        description: 'Test description',
        price: 100,
        coverUrl: 'http://test.com/image.jpg',
        guests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        countryCode: 'US',
        creatorId: 'user1',
        categoryId: 'cat1',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalNightsBooked: 0,
        totalIncome: 0,
      };

      mockContext.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockContext.prisma.property.create.mockResolvedValue(mockProperty);

      // Act
      const result = await service.create({
        name: 'Test Property',
        tagLine: 'Test tagline',
        description: 'Test description',
        price: 100,
        categoryId: 'cat1',
        coverUrl: 'http://test.com/image.jpg',
        guests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        countryCode: 'US',
        creatorId: 'user1',
      });

      // Assert
      expect(result).toEqual(mockProperty);
      expect(mockContext.prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat1' },
      });
    });

    it('should throw BadRequestException if category not found', async () => {
      // Arrange
      mockContext.prisma.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create({
          name: 'Test Property',
          tagLine: 'Test tagline',
          description: 'Test description',
          price: 100,
          categoryId: 'invalid_id',
          coverUrl: 'http://test.com/image.jpg',
          guests: 2,
          bedrooms: 1,
          beds: 1,
          baths: 1,
          countryCode: 'US',
          creatorId: 'user1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate and connect amenities if provided', async () => {
      // Arrange
      const mockCategory = {
        id: 'cat1',
        name: 'cabin',
        description: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAmenities: Amenity[] = [
        {
          id: 'amen1',
          name: 'wifi',
          description: 'High-speed wifi',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'amen2',
          name: 'pool',
          description: 'Swimming pool',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockProperty = {
        id: 'prop1',
        name: 'Test Property',
        tagLine: 'Test tagline',
        description: 'Test description',
        price: 100,
        coverUrl: 'http://test.com/image.jpg',
        guests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        countryCode: 'US',
        creatorId: 'user1',
        categoryId: 'cat1',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalNightsBooked: 0,
        totalIncome: 0,
      };

      mockContext.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockContext.prisma.amenity.findMany.mockResolvedValue(mockAmenities);
      mockContext.prisma.property.create.mockResolvedValue(mockProperty);

      // Act
      const result = await service.create({
        name: 'Test Property',
        tagLine: 'Test tagline',
        description: 'Test description',
        price: 100,
        categoryId: 'cat1',
        coverUrl: 'http://test.com/image.jpg',
        guests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        countryCode: 'US',
        creatorId: 'user1',
        amenityIds: ['amen1', 'amen2'],
      });

      // Assert
      expect(result).toEqual(mockProperty);
      expect(mockContext.prisma.amenity.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['amen1', 'amen2'] } },
      });
    });
  });

  describe('findByIdPublic', () => {
    it('should return property if found', async () => {
      // Arrange
      const mockProperty = {
        id: 'prop1',
        name: 'Test Property',
        tagLine: 'Test tagline',
        description: 'Test description',
        price: 100,
        coverUrl: 'http://test.com/image.jpg',
        guests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        countryCode: 'US',
        categoryId: 'cat1',
        creatorId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalNightsBooked: 0,
        totalIncome: 0,
        category: {
          id: 'cat1',
          name: 'cabin',
          description: 'test',
        },
        creator: {
          id: 'user1',
          username: 'testuser',
        },
        amenities: [],
      };

      mockContext.prisma.property.findUnique.mockResolvedValue(mockProperty);

      // Act
      const result = await service.findByIdPublic('prop1');

      // Assert
      expect(result).toEqual({
        ...mockProperty,
        amenities: [],
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      // Arrange
      mockContext.prisma.property.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByIdPublic('invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findManyPublic', () => {
    it('should return filtered properties', async () => {
      // Arrange
      const mockProperties = [
        {
          id: 'prop1',
          name: 'Test Property',
          tagLine: 'Test tagline',
          description: 'Test description',
          price: 100,
          coverUrl: 'http://test.com/image.jpg',
          guests: 2,
          bedrooms: 1,
          beds: 1,
          baths: 1,
          countryCode: 'US',
          categoryId: 'cat1',
          creatorId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          totalNightsBooked: 0,
          totalIncome: 0,
          category: {
            id: 'cat1',
            name: 'cabin',
            description: 'test',
          },
          amenities: [],
          creator: {
            id: 'user1',
            username: 'testuser',
          },
        },
      ];

      mockContext.prisma.property.findMany.mockResolvedValue(mockProperties);

      // Act
      const result = await service.findManyPublic({
        categoryName: 'cabin',
        propertyName: 'Test',
      });

      // Assert
      expect(result).toEqual(mockProperties);
      expect(mockContext.prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: { name: 'cabin' },
            name: { contains: 'Test', mode: 'insensitive' },
          },
        }),
      );
    });
  });
});
