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

@Injectable()
export class ReservationService {
  constructor(
    private databaseService: DatabaseService,
    private propertyService: PropertyService,
  ) {}

  async create(data: CreateReservationDto) {
    const property = await this.propertyService.findByIdWithFullDetails(
      data.propertyId,
    );

    // Validate number of guests
    if (data.numberOfGuests > property.guests) {
      throw new BadRequestException(
        `Number of guests (${data.numberOfGuests}) exceeds property capacity (${property.guests})`,
      );
    }

    const date1 = dayjs(data.startDate);
    const date2 = dayjs(data.endDate);
    const numberOfBookingDays = date2.diff(date1, 'day');
    const totalPrice =
      numberOfBookingDays * property.price * data.numberOfGuests;

    // Create reservation
    const reservation = await this.databaseService.reservation.create({
      data: {
        propertyId: data.propertyId,
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice,
        numberOfGuests: data.numberOfGuests,
      },
    });

    return reservation;
  }

  async findAll(
    propertyId?: string,
    userId?: string,
    skip?: number,
    take?: number,
  ) {
    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (userId) {
      where.userId = userId;
    }

    return this.databaseService.reservation.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip || 0,
      take: take || 10,
      include: {
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
      },
    });
  }

  async deleteReservation(reservationId: string) {
    const reservation = await this.databaseService.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const deletedReservation = await this.databaseService.reservation.delete({
      where: { id: reservationId },
    });

    return deletedReservation;
  }

  async updateReservation(
    reservationId: string,
    userId: string,
    data: UpdateReservationDto,
  ) {
    const existingReservation =
      await this.databaseService.reservation.findUnique({
        where: { id: reservationId },
        include: { property: true },
      });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Validate number of guests if being updated
    if (
      data.numberOfGuests &&
      data.numberOfGuests > existingReservation.property.guests
    ) {
      throw new BadRequestException(
        `Number of guests (${data.numberOfGuests}) exceeds property capacity (${existingReservation.property.guests})`,
      );
    }

    const date1 = dayjs(data.startDate || existingReservation.startDate);
    const date2 = dayjs(data.endDate || existingReservation.endDate);
    const numberOfBookingDays = date2.diff(date1, 'day');
    const numberOfGuests =
      data.numberOfGuests || existingReservation.numberOfGuests;
    const totalPrice =
      numberOfBookingDays * existingReservation.property.price * numberOfGuests;

    const updatedReservation = await this.databaseService.reservation.update({
      where: { id: reservationId },
      data: {
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.numberOfGuests && { numberOfGuests: data.numberOfGuests }),
        totalPrice,
      },
    });

    return updatedReservation;
  }

  async findById(reservationId: string) {
    const reservation = await this.databaseService.reservation.findUnique({
      where: { id: reservationId },
      include: {
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
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }
}
