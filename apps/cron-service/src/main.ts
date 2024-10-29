import { NestFactory } from '@nestjs/core';
import { CronServiceModule } from './cron-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CronServiceModule);
  await app.listen(3000);
}
bootstrap();
