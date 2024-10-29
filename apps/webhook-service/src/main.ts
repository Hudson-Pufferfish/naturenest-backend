import { NestFactory } from '@nestjs/core';
import { WebhookServiceModule } from './webhook-service.module';

async function bootstrap() {
  const app = await NestFactory.create(WebhookServiceModule);
  await app.listen(3000);
}
bootstrap();
