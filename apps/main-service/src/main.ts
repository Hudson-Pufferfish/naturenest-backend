import { NestFactory } from '@nestjs/core';
import { MainServiceModule } from './main-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MainServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
