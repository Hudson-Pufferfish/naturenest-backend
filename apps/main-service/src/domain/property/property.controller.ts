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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @ApiOperation({ summary: 'Create a new property' })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({
    status: 201,
    description: 'Property successfully created',
  })
  @Post()
  create(@Body() data: CreatePropertyDto, @UserReq() user: User) {
    data.creatorId = user.id;
    return this.propertyService.create(data);
  }

  @ApiOperation({ summary: 'Get all properties (public)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'categoryName', required: false, type: String })
  @ApiQuery({ name: 'propertyName', required: false, type: String })
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

  @ApiOperation({ summary: 'Update a property' })
  @ApiParam({ name: 'propertyId', type: String })
  @ApiBody({ type: UpdatePropertyDto })
  @UseGuards(PropertyGuard)
  @Patch(':propertyId')
  updateById(
    @Param('propertyId') propertyId: string,
    @Body() data: UpdatePropertyDto,
  ) {
    return this.propertyService.updateOrFailById(propertyId, data);
  }

  @ApiOperation({ summary: 'Delete a property' })
  @ApiParam({ name: 'propertyId', type: String })
  @UseGuards(PropertyGuard)
  @Delete(':propertyId')
  deleteById(@Param('propertyId') propertyId: string) {
    return this.propertyService.deleteOrFailById(propertyId);
  }

  @ApiOperation({ summary: 'Get all properties owned by current user' })
  @Get('my')
  getMyProperties(@UserReq() user: User) {
    return this.propertyService.findAllByCreatorIdWithFullDetails(user.id);
  }

  @ApiOperation({ summary: 'Get public property details' })
  @ApiParam({ name: 'propertyId', type: String })
  @Public()
  @Get(':propertyId')
  getPublicPropertyById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findPublicById(propertyId);
  }

  @ApiOperation({ summary: 'Get full property details (owner only)' })
  @ApiParam({ name: 'propertyId', type: String })
  @UseGuards(PropertyGuard)
  @Get(':propertyId/full')
  getFullPropertyById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findOrFailById(propertyId);
  }
}
