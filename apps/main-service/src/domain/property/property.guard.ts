import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PropertyService } from './property.service';

@Injectable()
export class PropertyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private propertyService: PropertyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const propertyId = request.params.propertyId;
    const method = request.method;
    const path = request.route.path;

    if (propertyId) {
      let property;
      try {
        property = await this.propertyService.findByIdWithFullDetails(
          propertyId,
        );
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`Property id ${propertyId} not found`);
        }
        throw error;
      }

      // For full property details, only allow property creator
      if (path.endsWith('/full') && property.creatorId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to view full details of this property',
        );
      }

      // For updates and deletes
      if (
        ['DELETE', 'PATCH'].includes(method) &&
        property.creatorId !== user.id
      ) {
        throw new ForbiddenException(
          `You are not authorized to ${
            method === 'DELETE' ? 'delete' : 'update'
          } this property`,
        );
      }

      return true;
    }

    return true;
  }
}
