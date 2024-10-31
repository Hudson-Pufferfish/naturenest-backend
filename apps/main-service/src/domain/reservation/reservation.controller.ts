import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UserReq } from '../../common/decorator/user.decorator';
import { User } from '@prisma/client';
import { ReservationGuard } from './reservation.guard';

@Controller('/reservations')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @UseGuards(ReservationGuard)
  @Get()
  findAll(@Query('propertyId') propertyId: string) {
    return this.reservationService.findAll(propertyId);
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
