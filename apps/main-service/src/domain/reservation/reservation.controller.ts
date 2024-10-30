import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UserReq } from '../../common/decorator/user.decorator';
import { User } from '@prisma/client';
@Controller('/reservations')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}
  @Get()
  findAll(@Query('propertyId') propertyId: string) {
    // TODO: query reservations by propertyId
  }
  @Post()
  create(@UserReq() user: User, @Body() data: CreateReservationDto) {
    data.userId = user.id;
    return this.reservationService.create(data);
  }
  @Patch()
  updateById(@Body() data) {
    // validation: currentDate > endDate
  }
  @Patch()
  cancelById(@Body() data) {
    // validation: currentDate > endDate
  }
}
