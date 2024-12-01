import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
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

  // TODO(@hudsonn) amenityIds
  // @IsNotEmpty()
  // @IsArray() fromm class-validator
  // amenityIds: string[];
  // extract from token
  creatorId: string;
}
