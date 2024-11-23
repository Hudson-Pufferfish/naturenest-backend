import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateFormat,
  IsBeforeEndDate,
} from '../../../common/decorator/date.decorator';

export class CreateReservationDto {
  @ApiProperty({
    example: 'clg2h7qxc0000356uk8r9d5g1',
    description: 'ID of the property to reserve',
  })
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Start date of the reservation (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat()
  @IsBeforeEndDate('endDate')
  startDate: string;

  @ApiProperty({
    example: '2024-03-20',
    description: 'End date of the reservation (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat()
  endDate: string;

  @ApiProperty({
    example: 2,
    description: 'Number of guests for the reservation',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  numberOfGuests: number;

  userId: string;
}
