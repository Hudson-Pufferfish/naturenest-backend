import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorator/public.decorator';

@Controller('/health')
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      message: 'service is up and running',
    };
  }
}
