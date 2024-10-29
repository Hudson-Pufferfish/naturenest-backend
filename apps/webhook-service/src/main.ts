import { NestFactory } from '@nestjs/core';
import { WebhookServiceModule } from './webhook-service.module';

async function bootstrap() {
  const app = await NestFactory.create(WebhookServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
