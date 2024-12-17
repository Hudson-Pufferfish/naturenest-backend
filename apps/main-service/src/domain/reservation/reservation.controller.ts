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
import { Throttle } from '@nestjs/throttler';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller({ path: '/reservations', version: '1' })
@UseGuards(ReservationGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @ApiOperation({ summary: 'Get all reservations' })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    description: 'Filter reservations by property ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservations successfully retrieved',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: [
          {
            id: 'res123',
            startDate: '2024-03-15',
            endDate: '2024-03-20',
            totalPrice: 750.0,
            numberOfGuests: 2,
            property: {
              name: 'Cozy Mountain Cabin',
              price: 150.0,
              coverUrl: 'https://example.com/image.jpg',
              creator: {
                id: 'user123',
                username: 'johndoe',
                email: 'john@example.com',
              },
            },
            user: {
              id: 'user456',
              username: 'janedoe',
              email: 'jane@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to view these reservations',
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
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'res123',
          propertyId: 'prop123',
          userId: 'user123',
          startDate: '2024-03-15',
          endDate: '2024-03-20',
          totalPrice: 750.0,
          numberOfGuests: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid dates or guest count',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Property not found' })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post()
  create(@UserReq() user: User, @Body() data: CreateReservationDto) {
    data.userId = user.id;
    return this.reservationService.create(data);
  }

  // TODO(@hudsonn) validation: currentDate < endDate
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiParam({ name: 'reservationId', type: String })
  @ApiBody({ type: UpdateReservationDto })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
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

  @ApiOperation({
    summary: 'Get all reservations for the current user',
    description:
      "Returns paginated list of user's reservations. " +
      'Can be filtered by status (upcoming/past/all) and ordered by creation date (newest first). ' +
      'Upcoming: startDate >= today, Past: endDate < today. ' +
      'Returns empty array if no reservations found.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    enum: ['upcoming', 'past', 'all'],
    description: 'Filter reservations by status (default: all)',
    example: 'upcoming',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip for pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of items to take (page size)',
    minimum: 1,
    maximum: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Reservations successfully retrieved',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: [
          {
            id: 'res123',
            startDate: '2024-03-15',
            endDate: '2024-03-20',
            totalPrice: 750.0,
            numberOfGuests: 2,
            createdAt: '2024-03-01T12:00:00Z',
            status: 'upcoming',
            property: {
              name: 'Cozy Mountain Cabin',
              price: 150.0,
              coverUrl: 'https://example.com/image.jpg',
              creator: {
                id: 'user123',
                username: 'johndoe',
                email: 'john@example.com',
              },
            },
            user: {
              id: 'user456',
              username: 'janedoe',
              email: 'jane@example.com',
            },
          },
          {
            id: 'res124',
            startDate: '2024-02-15',
            endDate: '2024-02-20',
            totalPrice: 500.0,
            numberOfGuests: 1,
            createdAt: '2024-02-01T12:00:00Z',
            status: 'past',
            property: {
              name: 'Beach House',
              price: 100.0,
              coverUrl: 'https://example.com/beach.jpg',
              creator: {
                id: 'user789',
                username: 'smith',
                email: 'smith@example.com',
              },
            },
            user: {
              id: 'user456',
              username: 'janedoe',
              email: 'jane@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @Get('my')
  getMyReservations(
    @UserReq() user: User,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status: 'upcoming' | 'past' | 'all' = 'all',
  ) {
    return this.reservationService.findAll(
      undefined,
      user.id,
      skip ? Number(skip) : undefined,
      take ? Number(take) : undefined,
      status,
    );
  }
}
