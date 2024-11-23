import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

  @Public()
  @Get()
  find(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('categoryName') categoryName?: string,
    @Query('propertyName') propertyName?: string,
  ) {
    return this.propertyService.findManyPublic({
      skip,
      take,
      categoryName,
      propertyName,
    });
  }

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

  @Get('my')
  getMyProperties(@UserReq() user: User) {
    return this.propertyService.findAllByCreatorIdWithFullDetails(user.id);
  }

  @Public()
  @Get(':propertyId')
  getPublicPropertyById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findPublicById(propertyId);
  }

  @UseGuards(PropertyGuard)
  @Get(':propertyId/full')
  getFullPropertyById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findOrFailById(propertyId);
  }
}
