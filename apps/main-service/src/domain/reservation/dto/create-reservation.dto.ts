import { IsNotEmpty, IsString } from 'class-validator';
export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  propertyId: string;
  // TODO: add validation for YYYY-MM-DD (MM should be 01-12, DD 01-31)
  @IsNotEmpty()
  @IsString()
  startDate: string;
  // TODO: add validation for YYYY-MM-DD
  // TODO: add validation for startDate < endDate
  @IsNotEmpty()
  @IsString()
  endDate: string;
  // extract from token
  userId: string;
}
