import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateFormat,
  IsBeforeEndDate,
  IsFutureEndDate,
} from '../../../common/decorator/date.decorator';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    example: '2024-03-16',
    description: 'New start date of the reservation (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @IsDateFormat()
  @IsBeforeEndDate('endDate')
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-03-21',
    description: 'New end date of the reservation (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @IsDateFormat()
  @IsFutureEndDate()
  endDate?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'New number of guests for the reservation',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfGuests?: number;
}
