import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UserReq } from '../../common/decorator/user.decorator';
import { User } from '@prisma/client';
import { ReservationGuard } from './reservation.guard';

@Controller('/reservations')
@UseGuards(ReservationGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get()
  findAll(@Query('propertyId') propertyId: string, @UserReq() user: User) {
    return this.reservationService.findAll(
      propertyId,
      propertyId ? undefined : user.id,
    );
  }

  @Post()
  create(@UserReq() user: User, @Body() data: CreateReservationDto) {
    data.userId = user.id;
    return this.reservationService.create(data);
  }

  // validation: currentDate < endDate
  @Patch(':reservationId')
  updateById(
    @Param('reservationId') reservationId: string,
    @UserReq() user: User,
    @Body() data: UpdateReservationDto,
  ) {
    return this.reservationService.updateReservation(
      reservationId,
      user.id,
      data,
    );
  }
  // validation: currentDate  endDate
  @Delete(':reservationId')
  deleteById(
    @Param('reservationId') reservationId: string,
    @UserReq() user: User,
  ) {
    return this.reservationService.deleteReservation(reservationId, user.id);
  }

  @Get(':reservationId')
  findById(@Param('reservationId') reservationId: string) {
    return this.reservationService.findById(reservationId);
  }
}
