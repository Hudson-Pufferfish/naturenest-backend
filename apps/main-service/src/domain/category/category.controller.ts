import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip (for pagination)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take (page size)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: [
          {
            id: 'clg2h7qxc0000356uk8r9d5g1',
            name: 'farmhouse',
            description: 'farmhouse',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'clg2h7qxc0000356uk8r9d5g2',
            name: 'cabin',
            description: 'cabin',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  find(@Query('skip') skip?: string, @Query('take') take?: string) {
    const parsedSkip = skip ? parseInt(skip) : 0;
    const parsedTake = take ? parseInt(take) : 10;
    return this.categoryService.findMany({
      skip: parsedSkip,
      take: parsedTake,
    });
  }
}
