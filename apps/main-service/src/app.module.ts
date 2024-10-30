import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { DomainModule } from './domain/domain.module';
import { AuthGuard } from './domain/guard/auth.guard';
import { HealthModule } from './health/health.module';
import { SerializeInterceptor } from './interceptor/serialize.interceptor';

@Module({
  imports: [HealthModule, DatabaseModule, DomainModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
