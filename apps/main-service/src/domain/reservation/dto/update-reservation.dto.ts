import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import {
  IsDateFormat,
  IsBeforeEndDate,
  IsFutureEndDate,
} from '../../../common/decorator/date.decorator';

export class UpdateReservationDto {
  @IsOptional()
  @IsString()
  @IsDateFormat()
  @IsBeforeEndDate('endDate')
  startDate?: string;

  @IsOptional()
  @IsString()
  @IsDateFormat()
  @IsFutureEndDate()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfGuests?: number;
}
