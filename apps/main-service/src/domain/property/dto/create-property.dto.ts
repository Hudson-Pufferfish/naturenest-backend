import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Matches,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Cozy Mountain Cabin',
    description: 'The name of the property',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Perfect getaway in the mountains',
    description: 'A short tagline describing the property',
    maxLength: 30,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  tagLine: string;

  @ApiProperty({
    example: 'This beautiful cabin features...',
    description: 'Detailed description of the property',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 150.0,
    description: 'Price per night',
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'clg2h7qxc0000356uk8r9d5g1',
    description: 'ID of the property category',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  // TODO(@hudsonn) countryId
  // @IsNotEmpty()
  // @IsString()
  // countryId: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the property cover image',
  })
  @IsNotEmpty()
  @IsString()
  coverUrl: string;

  @ApiProperty({
    example: 4,
    description: 'Maximum number of guests allowed',
  })
  @IsNotEmpty()
  @IsNumber()
  guests: number;

  @ApiProperty({
    example: 2,
    description: 'Number of bedrooms',
  })
  @IsNotEmpty()
  @IsNumber()
  bedrooms: number;

  @ApiProperty({
    example: 3,
    description: 'Number of beds',
  })
  @IsNotEmpty()
  @IsNumber()
  beds: number;

  @ApiProperty({
    example: 2,
    description: 'Number of bathrooms',
  })
  @IsNotEmpty()
  @IsNumber()
  baths: number;

  @ApiProperty({
    example: ['clg2h7qxc0000356uk8r9d5g1', 'clg2h7qxc0000356uk8r9d5g2'],
    description: 'Array of amenity IDs',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityIds?: string[];

  // extract from token
  creatorId: string;

  @ApiProperty({
    example: 'US',
    description: 'Two-letter country code (ISO 3166-1 alpha-2)',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'countryCode must be a valid two-letter ISO country code',
  })
  countryCode: string;
}
