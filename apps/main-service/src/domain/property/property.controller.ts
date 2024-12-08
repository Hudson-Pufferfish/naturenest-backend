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
@Controller({ path: '/properties', version: '1' })
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @ApiOperation({ summary: 'Create a new property' })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({
    status: 201,
    description: 'Property successfully created',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          name: 'Cozy Mountain Cabin',
          tagLine: 'Perfect getaway in the mountains',
          description: 'This beautiful cabin features...',
          price: 150.0,
          coverUrl: 'https://example.com/image.jpg',
          guests: 4,
          bedrooms: 2,
          beds: 3,
          baths: 2,
          categoryId: 'clg2h7qxc0000356uk8r9d5g2',
          creatorId: 'user123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          countryCode: 'US',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
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
  @ApiResponse({
    status: 200,
    description: 'Properties successfully retrieved',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: [
          {
            id: 'clg2h7qxc0000356uk8r9d5g1',
            name: 'Cozy Mountain Cabin',
            tagLine: 'Perfect getaway in the mountains',
            price: 150.0,
            coverUrl: 'https://example.com/image.jpg',
            countryCode: 'US',
            category: {
              id: 'cat123',
              name: 'cabin',
            },
            creator: {
              id: 'user123',
              username: 'johndoe',
            },
            amenities: [
              {
                id: 'amen123',
                name: 'pig_feeding',
                description: 'Experience feeding and caring for pigs',
              },
              {
                id: 'amen124',
                name: 'crop_harvesting',
                description: 'Participate in harvesting seasonal crops',
              },
            ],
          },
        ],
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: 'Property successfully updated',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          name: 'Updated Cabin Name',
          tagLine: 'New perfect getaway tagline',
          description: 'Updated description...',
          price: 175.0,
          coverUrl: 'https://example.com/new-image.jpg',
          guests: 5,
          bedrooms: 3,
          beds: 4,
          baths: 2,
          categoryId: 'clg2h7qxc0000356uk8r9d5g2',
          creatorId: 'user123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          countryCode: 'US',
          amenities: [
            {
              id: 'amen123',
              name: 'pig_feeding',
              description: 'Experience feeding and caring for pigs',
            },
            {
              id: 'amen124',
              name: 'crop_harvesting',
              description: 'Participate in harvesting seasonal crops',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the property owner',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Property not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Property successfully deleted',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          name: 'Cozy Mountain Cabin',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the property owner',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Property not found' })
  @UseGuards(PropertyGuard)
  @Delete(':propertyId')
  deleteById(@Param('propertyId') propertyId: string) {
    return this.propertyService.deleteOrFailById(propertyId);
  }

  @ApiOperation({ summary: 'Get all properties owned by current user' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiResponse({
    status: 200,
    description: 'Properties successfully retrieved',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: [
          {
            id: 'clg2h7qxc0000356uk8r9d5g1',
            name: 'Cozy Mountain Cabin',
            tagLine: 'Perfect getaway in the mountains',
            price: 150.0,
            totalNightsBooked: 15,
            totalIncome: 2250.0,
            category: {
              id: 'cat123',
              name: 'cabin',
            },
            reservations: [
              {
                id: 'res123',
                startDate: '2024-03-15',
                endDate: '2024-03-20',
                totalPrice: 750.0,
                numberOfGuests: 2,
                user: {
                  id: 'user456',
                  username: 'janedoe',
                  email: 'jane@example.com',
                },
              },
            ],
            countryCode: 'US',
            amenities: [
              {
                id: 'amen123',
                name: 'pig_feeding',
                description: 'Experience feeding and caring for pigs',
              },
              {
                id: 'amen124',
                name: 'crop_harvesting',
                description: 'Participate in harvesting seasonal crops',
              },
            ],
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
  getMyProperties(
    @UserReq() user: User,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.propertyService.findAllByCreatorIdWithFullDetails(
      user.id,
      skip ? Number(skip) : undefined,
      take ? Number(take) : undefined,
    );
  }

  @ApiOperation({
    summary: 'Get public property details',
    description:
      'Returns public property details excluding private data (totalNightsBooked, totalIncome, creator.email, reservations)',
  })
  @ApiParam({ name: 'propertyId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Property details successfully retrieved',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          name: 'Cozy Mountain Cabin',
          tagLine: 'Perfect getaway in the mountains',
          description: 'This beautiful cabin features...',
          price: 150.0,
          coverUrl: 'https://example.com/image.jpg',
          guests: 4,
          bedrooms: 2,
          beds: 3,
          baths: 2,
          countryCode: 'US',
          category: {
            id: 'cat123',
            name: 'cabin',
          },
          creator: {
            id: 'user123',
            username: 'johndoe',
          },
          amenities: [
            {
              id: 'amen123',
              name: 'pig_feeding',
              description: 'Experience feeding and caring for pigs',
            },
            {
              id: 'amen124',
              name: 'crop_harvesting',
              description: 'Participate in harvesting seasonal crops',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Not Found - Property not found' })
  @Public()
  @Get(':propertyId')
  getPublicPropertyById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findPublicById(propertyId);
  }

  @ApiOperation({ summary: 'Get full property details (owner only)' })
  @ApiParam({ name: 'propertyId', type: String })
  @ApiResponse({
    status: 200,
    description:
      'Returns property details including private data (totalNightsBooked, totalIncome, creator.email, reservations)',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          name: 'Cozy Mountain Cabin',
          tagLine: 'Perfect getaway in the mountains',
          description: 'This beautiful cabin features...',
          price: 150.0,
          coverUrl: 'https://example.com/image.jpg',
          guests: 4,
          bedrooms: 2,
          beds: 3,
          baths: 2,
          totalNightsBooked: 15,
          totalIncome: 2250.0,
          category: {
            id: 'cat123',
            name: 'cabin',
          },
          creator: {
            id: 'user123',
            username: 'johndoe',
            email: 'john@example.com',
          },
          reservations: [
            {
              id: 'res123',
              startDate: '2024-03-15',
              endDate: '2024-03-20',
              totalPrice: 750.0,
              numberOfGuests: 2,
              user: {
                id: 'user456',
                username: 'janedoe',
                email: 'jane@example.com',
              },
            },
          ],
          countryCode: 'US',
          amenities: [
            {
              id: 'amen123',
              name: 'pig_feeding',
              description: 'Experience feeding and caring for pigs',
            },
            {
              id: 'amen124',
              name: 'crop_harvesting',
              description: 'Participate in harvesting seasonal crops',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the property owner',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Property not found' })
  @UseGuards(PropertyGuard)
  @Get(':propertyId/full')
  getFullPropertyById(@Param('propertyId') propertyId: string) {
    return this.propertyService.findOrFailById(propertyId);
  }
}
