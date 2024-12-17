import { ReservationService } from './reservation.service';
import { PropertyService } from '../property/property.service';
import { createTestingModule } from '../../test/test-utils';
import { MockContext } from '../../database/database.service.test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';

describe('ReservationService', () => {
  let service: ReservationService;
  let mockContext: MockContext;
  let propertyService: jest.Mocked<PropertyService>;

  beforeEach(async () => {
    propertyService = {
      findByIdWithFullDetails: jest.fn(),
    } as any;

    const { module, mockContext: mc } = await createTestingModule([
      ReservationService,
      {
        provide: PropertyService,
        useValue: propertyService,
      },
    ]);

    service = module.get<ReservationService>(ReservationService);
    mockContext = mc;
  });

  describe('create', () => {
    it('should create a reservation with valid data', async () => {
      // Arrange
      const mockProperty = {
        id: 'prop1',
        name: 'Test Property',
        tagLine: 'Test tagline',
        description: 'Test description',
        price: 100,
        coverUrl: 'http://test.com/image.jpg',
        guests: 4,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        countryCode: 'US',
        creatorId: 'owner1',
        categoryId: 'cat1',
        totalNightsBooked: 0,
        totalIncome: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
        amenities: [],
        category: {
          id: 'cat1',
          name: 'cabin',
          description: 'test',
        },
        creator: {
          id: 'owner1',
          email: 'owner@test.com',
          username: 'owner',
        },
      };

      const mockReservation = {
        id: 'res1',
        propertyId: 'prop1',
        userId: 'user1',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        totalPrice: 600,
        numberOfGuests: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);
      mockContext.prisma.reservation.create.mockResolvedValue(mockReservation);

      // Act
      const result = await service.create({
        propertyId: 'prop1',
        userId: 'user1',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        numberOfGuests: 3,
      });

      // Assert
      expect(result).toEqual(mockReservation);
      expect(mockContext.prisma.reservation.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'prop1',
          userId: 'user1',
          startDate: '2024-04-01',
          endDate: '2024-04-03',
          totalPrice: 600,
          numberOfGuests: 3,
        },
      });
    });

    it('should throw BadRequestException if guests exceed property capacity', async () => {
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
        creatorId: 'owner1',
        categoryId: 'cat1',
        totalNightsBooked: 0,
        totalIncome: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
        amenities: [],
        category: {
          id: 'cat1',
          name: 'cabin',
          description: 'test',
        },
        creator: {
          id: 'owner1',
          email: 'owner@test.com',
          username: 'owner',
        },
      };

      propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);

      // Act & Assert
      await expect(
        service.create({
          propertyId: 'prop1',
          userId: 'user1',
          startDate: '2024-04-01',
          endDate: '2024-04-03',
          numberOfGuests: 3, // Trying to book for 3 guests
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return filtered reservations', async () => {
      // Arrange
      const mockReservations = [
        {
          id: 'res1',
          propertyId: 'prop1',
          userId: 'user1',
          startDate: '2024-04-01',
          endDate: '2024-04-03',
          totalPrice: 600,
          numberOfGuests: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          property: {
            name: 'Test Property',
            price: 100,
            coverUrl: 'http://test.com/image.jpg',
            creator: {
              id: 'owner1',
              username: 'owner',
              email: 'owner@test.com',
            },
          },
          user: {
            id: 'user1',
            username: 'user',
            email: 'user@test.com',
          },
        },
      ];

      mockContext.prisma.reservation.findMany.mockResolvedValue(
        mockReservations,
      );

      // Act
      const result = await service.findAll('prop1', undefined, 0, 10);

      // Assert
      expect(result).toEqual(mockReservations);
      expect(mockContext.prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop1' },
        }),
      );
    });

    it('should filter by upcoming status', async () => {
      // Arrange
      const currentDate = dayjs().format('YYYY-MM-DD');
      mockContext.prisma.reservation.findMany.mockResolvedValue([]);

      // Act
      await service.findAll(undefined, 'user1', 0, 10, 'upcoming');

      // Assert
      expect(mockContext.prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user1',
            startDate: { gte: currentDate },
          },
        }),
      );
    });
  });

  describe('updateReservation', () => {
    it('should update reservation with valid data', async () => {
      // Arrange
      const mockExistingReservation = {
        id: 'res1',
        propertyId: 'prop1',
        userId: 'user1',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        totalPrice: 600,
        numberOfGuests: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        property: {
          price: 100,
          guests: 4,
        },
      };

      const mockUpdatedReservation = {
        ...mockExistingReservation,
        numberOfGuests: 2,
        totalPrice: 400,
      };

      mockContext.prisma.reservation.findUnique.mockResolvedValue(
        mockExistingReservation,
      );
      mockContext.prisma.reservation.update.mockResolvedValue(
        mockUpdatedReservation,
      );

      // Act
      const result = await service.updateReservation('res1', 'user1', {
        numberOfGuests: 2,
      });

      // Assert
      expect(result).toEqual(mockUpdatedReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      // Arrange
      mockContext.prisma.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateReservation('invalid_id', 'user1', {
          numberOfGuests: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteReservation', () => {
    it('should delete existing reservation', async () => {
      // Arrange
      const mockReservation = {
        id: 'res1',
        propertyId: 'prop1',
        userId: 'user1',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        totalPrice: 600,
        numberOfGuests: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.prisma.reservation.findUnique.mockResolvedValue(
        mockReservation,
      );
      mockContext.prisma.reservation.delete.mockResolvedValue(mockReservation);

      // Act
      const result = await service.deleteReservation('res1');

      // Assert
      expect(result).toEqual(mockReservation);
      expect(mockContext.prisma.reservation.delete).toHaveBeenCalledWith({
        where: { id: 'res1' },
      });
    });

    it('should throw NotFoundException if reservation not found', async () => {
      // Arrange
      mockContext.prisma.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteReservation('invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
