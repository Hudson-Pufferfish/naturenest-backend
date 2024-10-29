import { Controller, Get } from '@nestjs/common';

@Controller('/health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      message: 'service is up and running',
    };
  }
}
