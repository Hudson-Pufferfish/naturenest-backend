import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorator/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@SkipThrottle()
@Controller({ path: '/health', version: '1' })
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return {
      message: 'service is up and running TEST',
    };
  }
}
