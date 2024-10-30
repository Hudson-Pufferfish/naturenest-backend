import { DomainModule } from './domain/domain.module';
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SerializeInterceptor } from './interceptor/serialize.interceptor';

@Module({
  imports: [HealthModule, DatabaseModule, DomainModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
  ],
})
export class AppModule {}
