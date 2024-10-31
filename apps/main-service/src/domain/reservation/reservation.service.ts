import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PropertyService } from '../property/property.service';
import dayjs from 'dayjs';
@Injectable()
export class ReservationService {
  constructor(
    private databaseService: DatabaseService,
    private propertyService: PropertyService,
  ) {}
  async create(data: CreateReservationDto) {
    const property = await this.propertyService.findOrFailById(data.propertyId);
    const date1 = dayjs(data.startDate);
    const date2 = dayjs(data.endDate);
    const numberOfBookingDays = date2.diff(date1, 'day');
    const totalPrice = numberOfBookingDays * property.price;
    // TODO: validate conflict
    return this.databaseService.reservation.create({
      data: {
        propertyId: data.propertyId,
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice,
      },
    });
    // TODO: send email to user
  }
  async findAll(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};
    return this.databaseService.reservation.findMany({
      where,
    });
  }
}
