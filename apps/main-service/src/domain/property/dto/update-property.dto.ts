import { IsOptional, IsNumber, IsString, MaxLength } from 'class-validator';
export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  @MaxLength(30)
  tagLine: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsNumber()
  price: number;
  @IsOptional()
  @IsString()
  categoryId: string;
  @IsOptional()
  @IsString()
  coverUrl: string;
  @IsOptional()
  @IsNumber()
  guests: number;
  @IsOptional()
  @IsNumber()
  bedrooms: number;
  @IsOptional()
  @IsNumber()
  beds: number;
  @IsOptional()
  @IsNumber()
  baths: number;
  // extract from token
  creatorId: string;
}
