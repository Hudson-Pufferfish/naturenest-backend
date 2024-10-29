import { NestFactory } from '@nestjs/core';
import { CronServiceModule } from './cron-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CronServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
