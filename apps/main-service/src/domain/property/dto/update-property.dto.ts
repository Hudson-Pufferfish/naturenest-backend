import { IsOptional, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePropertyDto {
  @ApiPropertyOptional({
    example: 'Updated Cabin Name',
    description: 'The name of the property',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'New perfect getaway tagline',
    description: 'A short tagline describing the property',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  tagLine: string;

  @ApiPropertyOptional({
    example: 'Updated description...',
    description: 'Detailed description of the property',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 175.0,
    description: 'Price per night',
  })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    example: 'clg2h7qxc0000356uk8r9d5g2',
    description: 'ID of the property category',
  })
  @IsOptional()
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({
    example: 'https://example.com/new-image.jpg',
    description: 'URL of the property cover image',
  })
  @IsOptional()
  @IsString()
  coverUrl: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Maximum number of guests allowed',
  })
  @IsOptional()
  @IsNumber()
  guests: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Number of bedrooms',
  })
  @IsOptional()
  @IsNumber()
  bedrooms: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Number of beds',
  })
  @IsOptional()
  @IsNumber()
  beds: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of bathrooms',
  })
  @IsOptional()
  @IsNumber()
  baths: number;

  creatorId: string;
}
