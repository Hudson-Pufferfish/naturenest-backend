import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyService } from './property.service';
import { UserReq } from '../../common/decorator/user.decorator';
import { User } from '@prisma/client';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyGuard } from './property.guard';
import { Public } from '../../common/decorator/public.decorator';

@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}
  @Post()
  create(@Body() data: CreatePropertyDto, @UserReq() user: User) {
    data.creatorId = user.id;
    return this.propertyService.create(data);
  }
  // TODO: add get properties using cursor based pagination
  @UseGuards(PropertyGuard)
  @Patch(':propertyId')
  updateById(
    @Param('propertyId') propertyId: string,
    @Body() data: UpdatePropertyDto,
  ) {
    return this.propertyService.updateOrFailById(propertyId, data);
  }
  @UseGuards(PropertyGuard)
  @Delete(':propertyId')
  deleteById(@Param('propertyId') propertyId: string) {
    return this.propertyService.deleteOrFailById(propertyId);
  }
  @Get(':propertyId')
  getById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findOrFailById(propertyId);
  }
  @Public()
  @Get()
  getAll() {
    return this.propertyService.findAll();
  }
}
