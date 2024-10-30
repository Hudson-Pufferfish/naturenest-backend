import { Body, Controller, Post } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyService } from './property.service';
import { UserReq } from '../../common/decorator/user.decorator';
import { User } from '@prisma/client';
@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}
  @Post()
  create(@Body() data: CreatePropertyDto, @UserReq() user: User) {
    data.creatorId = user.id;
    return this.propertyService.create(data);
  }
  // TODO: add get properties using cursor based pagination
}