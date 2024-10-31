import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
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
    const user = request.user;
    const propertyId = request.query.propertyId;

    if (propertyId) {
      const property = await this.propertyService.findOrFailById(propertyId);
      if (property.creatorId !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to view reservations for this property',
        );
      }
    }

    return true;
  }
}
