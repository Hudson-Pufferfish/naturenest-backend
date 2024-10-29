import { Controller, Get } from '@nestjs/common';
import { WebhookServiceService } from './webhook-service.service';

@Controller()
export class WebhookServiceController {
  constructor(private readonly webhookServiceService: WebhookServiceService) {}

  @Get()
  getHello(): string {
    return this.webhookServiceService.getHello();
  }
}
