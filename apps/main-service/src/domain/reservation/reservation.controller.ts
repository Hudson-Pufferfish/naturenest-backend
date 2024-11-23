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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('/reservations')
@UseGuards(ReservationGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @ApiOperation({ summary: 'Get all reservations' })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    description: 'Filter reservations by property ID',
  })
  @Get()
  findAll(@Query('propertyId') propertyId: string, @UserReq() user: User) {
    return this.reservationService.findAll(
      propertyId,
      propertyId ? undefined : user.id,
    );
  }

  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({
    status: 201,
    description: 'Reservation successfully created',
  })
  @Post()
  create(@UserReq() user: User, @Body() data: CreateReservationDto) {
    data.userId = user.id;
    return this.reservationService.create(data);
  }

  // TODO(@hudsonn) validation: currentDate < endDate
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiParam({ name: 'reservationId', type: String })
  @ApiBody({ type: UpdateReservationDto })
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

  // TODO(@hudsonn) validation: currentDate < endDate
  @ApiOperation({ summary: 'Delete a reservation' })
  @ApiParam({ name: 'reservationId', type: String })
  @Delete(':reservationId')
  deleteReservation(@Param('reservationId') reservationId: string) {
    return this.reservationService.deleteReservation(reservationId);
  }

  @ApiOperation({ summary: 'Get a specific reservation' })
  @ApiParam({ name: 'reservationId', type: String })
  @Get(':reservationId')
  findById(@Param('reservationId') reservationId: string) {
    return this.reservationService.findById(reservationId);
  }
}
