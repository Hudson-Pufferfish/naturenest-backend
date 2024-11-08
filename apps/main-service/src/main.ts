import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Added CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development
      'https://your-future-naturenest-frontend-link.com', // Future deployed frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow credentials if necessary
  });

  app.setGlobalPrefix('api');
  // setup validation
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
      validationError: {
        target: false,
      },
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.table({
    app: process.env.SERVICE_NAME,
    port: port,
  });
}
bootstrap();
