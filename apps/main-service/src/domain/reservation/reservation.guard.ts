import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { PropertyService } from '../property/property.service';

@Injectable()
export class ReservationGuard implements CanActivate {
  constructor(
    private reservationService: ReservationService,
    private propertyService: PropertyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;

    // Allow /reservations/my endpoint - it only needs auth
    if (path === '/v1/reservations/my') {
      return true;
    }

    const user = request.user;
    const propertyId = request.query.propertyId;
    const reservationId = request.params.reservationId;
    const method = request.method;

    // Case 1: Getting reservations for a property (for property owners)
    if (propertyId) {
      const property = await this.propertyService.findByIdWithFullDetails(
        propertyId,
      );
      if (property.creatorId !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to view reservations for this property',
        );
      }
      return true;
    }

    // Case 2: Accessing a specific reservation
    if (reservationId) {
      let reservation;
      try {
        reservation = await this.reservationService.findById(reservationId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException('Reservation not found');
        }
        throw error;
      }

      // For updates and deletes, allow both reservation creator and property owner
      if (
        ['DELETE', 'PATCH'].includes(method) &&
        reservation.userId !== user.id &&
        reservation.property.creator.id !== user.id
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
        reservation.property.creator.id !== user.id
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
