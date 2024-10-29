import { Module } from '@nestjs/common';
import { WebhookServiceController } from './webhook-service.controller';
import { WebhookServiceService } from './webhook-service.service';

@Module({
  imports: [],
  controllers: [WebhookServiceController],
  providers: [WebhookServiceService],
})
export class WebhookServiceModule {}
