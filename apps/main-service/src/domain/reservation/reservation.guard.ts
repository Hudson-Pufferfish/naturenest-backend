import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { PropertyService } from '../property/property.service';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReservationGuard implements CanActivate {
  constructor(
    private reservationService: ReservationService,
    private propertyService: PropertyService,
    private databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const propertyId = request.query.propertyId;
    const reservationId = request.params.reservationId;
    const method = request.method;

    // Case 1: Getting reservations for a property (for property owners)
    if (propertyId) {
      const property = await this.propertyService.findOrFailById(propertyId);
      if (property.creatorId !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to view reservations for this property',
        );
      }
      return true;
    }

    // Case 2: Accessing a specific reservation
    if (reservationId) {
      const reservation = await this.databaseService.reservation.findUnique({
        where: { id: reservationId },
        include: {
          property: true,
        },
      });

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      // For updates and deletes, allow both reservation creator and property owner
      if (
        ['DELETE', 'PATCH'].includes(method) &&
        reservation.userId !== user.id &&
        reservation.property.creatorId !== user.id
      ) {
        throw new ForbiddenException(
          `You are not authorized to ${
            method === 'DELETE' ? 'delete' : 'update'
          } this reservation`,
        );
      }

      // For viewing (GET), either the reservation creator or property owner can access
      if (
        method === 'GET' &&
        reservation.userId !== user.id &&
        reservation.property.creatorId !== user.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to view this reservation',
        );
      }

      return true;
    }

    return true;
  }
}
