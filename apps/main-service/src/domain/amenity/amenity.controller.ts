import { Controller, Get, Query } from '@nestjs/common';
import { AmenityService } from './amenity.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorator/public.decorator';

@ApiTags('amenities')
@Controller({ path: '/amenities', version: '1' })
export class AmenityController {
  constructor(private amenityService: AmenityService) {}

  @Public()
  @ApiOperation({ summary: 'Get all amenities with pagination' })
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
    description: 'List of amenities retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: [
          {
            id: 'clg2h7qxc0000356uk8r9d5g1',
            name: 'pig_feeding',
            description: 'Experience feeding and caring for pigs',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @Get()
  find(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.amenityService.findMany({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }
}
