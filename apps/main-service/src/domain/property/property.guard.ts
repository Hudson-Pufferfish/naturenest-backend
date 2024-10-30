import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PropertyService } from './property.service';
@Injectable()
export class PropertyGuard implements CanActivate {
  constructor(
    // private databaseService: DatabaseService,
    private reflector: Reflector,
    private propertyService: PropertyService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const propertyId = request.params.propertyId;
    const property = await this.propertyService.findOrFailById(propertyId);
    if (property.creatorId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update/delete this property',
      );
    }
    return true;
  }
}
