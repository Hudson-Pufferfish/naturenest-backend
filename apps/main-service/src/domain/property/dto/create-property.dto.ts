import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreatePropertyDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  tagLine: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  @IsNumber()
  price: number;
  @IsNotEmpty()
  @IsString()
  categoryId: string;
  // @IsNotEmpty()
  // @IsString()
  // countryId: string;
  @IsNotEmpty()
  @IsString()
  coverUrl: string;
  @IsNotEmpty()
  @IsNumber()
  guests: number;
  @IsNotEmpty()
  @IsNumber()
  bedrooms: number;
  @IsNotEmpty()
  @IsNumber()
  beds: number;
  @IsNotEmpty()
  @IsNumber()
  baths: number;
  // @IsNotEmpty()
  // @IsArray()
  // amenityIds: string[];
  // extract from token
  creatorId: string;
}