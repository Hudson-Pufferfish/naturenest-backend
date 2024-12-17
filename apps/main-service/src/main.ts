import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Added CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development
      'https://naturenest-dev.vercel.app/', // Future deployed frontend
      'https://naturenest-dev.netlify.app', // Future deployed frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow credentials if necessary
  });

  // Enable versioning with backward compatibility
  // This configuration ensures:
  // 1. All routes are prefixed with /api/v1
  // 2. Existing clients using /api/* will be automatically redirected to /api/v1/*
  // 3. When v2 is needed in future:
  //    - Create new controllers with @Controller({ version: '2' })
  //    - Keep v1 controllers working for existing clients
  //    - New clients can start using v2 endpoints
  //    - Eventually deprecate v1 after all clients have migrated
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Makes /api/health redirect to /api/v1/health
    prefix: 'api/v',
  });

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

  // Swagger configuration with factory
  const options = new DocumentBuilder()
    .setTitle('NatureNest API')
    .setDescription('The NatureNest API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints for sign-in, register, etc.')
    .addTag('users', 'User management endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('categories', 'Property category management endpoints')
    .addTag('reservations', 'Reservation management endpoints')
    .addTag('properties', 'Property management endpoints')
    .build();

  // Create document with server configuration
  const v1Document = () =>
    SwaggerModule.createDocument(app, {
      ...options,
      servers: [
        {
          url: '/',
          description: 'Current stable version (v1)',
        },
      ],
    });

  // Setup Swagger UI at /api/docs instead of /api/v1/docs
  // Documentation itself isn't versioned - it just shows docs for all API versions
  SwaggerModule.setup('api/docs', app, v1Document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.table({
    app: process.env.SERVICE_NAME,
    port: port,
  });
}
bootstrap();
