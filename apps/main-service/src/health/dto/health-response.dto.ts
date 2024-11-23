import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'service is up and running',
    description: 'Health check status message',
  })
  message: string;
}
