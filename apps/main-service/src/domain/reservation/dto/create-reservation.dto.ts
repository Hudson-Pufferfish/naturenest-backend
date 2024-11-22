import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import {
  IsDateFormat,
  IsBeforeEndDate,
} from '../../../common/decorator/date.decorator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @IsNotEmpty()
  @IsString()
  @IsDateFormat()
  @IsBeforeEndDate('endDate')
  startDate: string;

  @IsNotEmpty()
  @IsString()
  @IsDateFormat()
  endDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  numberOfGuests: number;

  // extract from token
  userId: string;
}
