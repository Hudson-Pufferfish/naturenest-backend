import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PropertyService } from '../property/property.service';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Prisma, Reservation } from '@prisma/client';

dayjs.extend(isBetween);

interface DailyAvailability {
  date: string;
  totalGuests: number;
  availableSlots: number;
}

type ReservationWhereInput = {
  propertyId?: string;
  userId?: string;
  startDate?: Prisma.StringFilter;
  endDate?: Prisma.StringFilter;
  AND?: Prisma.ReservationWhereInput[];
};

type ReservationInclude = {
  property: {
    select: {
      name: boolean;
      price: boolean;
      coverUrl: boolean;
      creator: {
        select: {
          id: boolean;
          username: boolean;
          email: boolean;
        };
      };
    };
  };
  user: {
    select: {
      id: boolean;
      username: boolean;
      email: boolean;
    };
  };
};

@Injectable()
export class ReservationService {
  constructor(
    private databaseService: DatabaseService,
    private propertyService: PropertyService,
  ) {}

  private validateDates(startDate: string, endDate: string): void {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const today = dayjs().startOf('day');

    if (start.isBefore(today)) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (end.isBefore(start)) {
      throw new BadRequestException('End date must be after start date');
    }
  }

  private calculateTotalPrice(
    startDate: string,
    endDate: string,
    pricePerNight: number,
    numberOfGuests: number,
  ): number {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const numberOfBookingDays = end.diff(start, 'day') + 1;
    return numberOfBookingDays * pricePerNight * numberOfGuests;
  }

  /**
   * Checks if a property has available capacity for the requested dates
   * @returns Array of daily availability information
   * @throws BadRequestException if capacity is exceeded on any day
   */
  private async checkPropertyAvailability(
    propertyId: string,
    startDate: string,
    endDate: string,
    requestedGuests: number,
    excludeReservationId?: string,
  ): Promise<DailyAvailability[]> {
    const property = await this.propertyService.findByIdWithFullDetails(
      propertyId,
    );
    const propertyCapacity = property.guests;

    const overlappingReservations =
      await this.databaseService.reservation.findMany({
        where: {
          propertyId,
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
            ...(excludeReservationId
              ? [{ NOT: { id: excludeReservationId } }]
              : []),
          ],
        },
      });

    const dailyGuestCounts = new Map<string, number>();
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const daysInRange = end.diff(start, 'day') + 1;

    // Initialize all dates with the requested guest count
    for (let i = 0; i < daysInRange; i++) {
      const currentDate = start.add(i, 'day').format('YYYY-MM-DD');
      dailyGuestCounts.set(currentDate, requestedGuests);
    }

    // Add guests from existing reservations
    overlappingReservations.forEach((reservation) => {
      const resStart = dayjs(reservation.startDate);
      const resEnd = dayjs(reservation.endDate);

      for (let i = 0; i < daysInRange; i++) {
        const currentDate = start.add(i, 'day').format('YYYY-MM-DD');
        if (dayjs(currentDate).isBetween(resStart, resEnd, 'day', '[]')) {
          const existingCount = dailyGuestCounts.get(currentDate) || 0;
          dailyGuestCounts.set(
            currentDate,
            existingCount + reservation.numberOfGuests,
          );
        }
      }
    });

    const availability: DailyAvailability[] = [];
    let hasAvailabilityIssue = false;
    let errorMessage = '';

    dailyGuestCounts.forEach((totalGuests, date) => {
      const availableSlots = propertyCapacity - totalGuests;
      availability.push({ date, totalGuests, availableSlots });

      if (availableSlots < 0) {
        hasAvailabilityIssue = true;
        errorMessage += `\n- ${date}: Exceeds capacity by ${Math.abs(
          availableSlots,
        )} guests`;
      }
    });

    if (hasAvailabilityIssue) {
      throw new BadRequestException(
        `Property capacity exceeded on following dates:${errorMessage}\n` +
          `Property capacity: ${propertyCapacity} guests`,
      );
    }

    return availability;
  }

  async create(data: CreateReservationDto): Promise<Reservation> {
    this.validateDates(data.startDate, data.endDate);

    const property = await this.propertyService.findByIdWithFullDetails(
      data.propertyId,
    );
    await this.checkPropertyAvailability(
      data.propertyId,
      data.startDate,
      data.endDate,
      data.numberOfGuests,
    );

    const totalPrice = this.calculateTotalPrice(
      data.startDate,
      data.endDate,
      property.price,
      data.numberOfGuests,
    );

    return this.databaseService.reservation.create({
      data: {
        propertyId: data.propertyId,
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice,
        numberOfGuests: data.numberOfGuests,
      },
    });
  }

  async updateReservation(
    reservationId: string,
    userId: string,
    data: UpdateReservationDto,
  ): Promise<Reservation> {
    const existingReservation =
      await this.databaseService.reservation.findUnique({
        where: { id: reservationId },
        include: { property: true },
      });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    const startDate = data.startDate || existingReservation.startDate;
    const endDate = data.endDate || existingReservation.endDate;
    const numberOfGuests =
      data.numberOfGuests || existingReservation.numberOfGuests;

    this.validateDates(startDate, endDate);

    await this.checkPropertyAvailability(
      existingReservation.propertyId,
      startDate,
      endDate,
      numberOfGuests,
      reservationId,
    );

    const totalPrice = this.calculateTotalPrice(
      startDate,
      endDate,
      existingReservation.property.price,
      numberOfGuests,
    );

    return this.databaseService.reservation.update({
      where: { id: reservationId },
      data: {
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.numberOfGuests && { numberOfGuests: data.numberOfGuests }),
        totalPrice,
      },
    });
  }

  async findAll(
    propertyId?: string,
    userId?: string,
    skip?: number,
    take?: number,
    status?: 'upcoming' | 'past' | 'all',
  ) {
    const where: ReservationWhereInput = {};
    const currentDate = dayjs().format('YYYY-MM-DD');

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status === 'upcoming') {
      where.startDate = { gte: currentDate };
    } else if (status === 'past') {
      where.endDate = { lt: currentDate };
    }

    const include: ReservationInclude = {
      property: {
        select: {
          name: true,
          price: true,
          coverUrl: true,
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    };

    return this.databaseService.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip || 0,
      take: take || 10,
      include,
    });
  }

  async findById(reservationId: string) {
    const include: ReservationInclude = {
      property: {
        select: {
          name: true,
          price: true,
          coverUrl: true,
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    };

    const reservation = await this.databaseService.reservation.findUnique({
      where: { id: reservationId },
      include,
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async deleteReservation(reservationId: string): Promise<Reservation> {
    const reservation = await this.databaseService.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.databaseService.reservation.delete({
      where: { id: reservationId },
    });
  }
}
