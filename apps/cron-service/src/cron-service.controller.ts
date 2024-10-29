import { Controller, Get } from '@nestjs/common';
import { CronServiceService } from './cron-service.service';

@Controller()
export class CronServiceController {
  constructor(private readonly cronServiceService: CronServiceService) {}

  @Get()
  getHello(): string {
    return this.cronServiceService.getHello();
  }
}
