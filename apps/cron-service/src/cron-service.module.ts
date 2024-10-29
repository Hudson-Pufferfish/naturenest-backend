import { Module } from '@nestjs/common';
import { CronServiceController } from './cron-service.controller';
import { CronServiceService } from './cron-service.service';

@Module({
  imports: [],
  controllers: [CronServiceController],
  providers: [CronServiceService],
})
export class CronServiceModule {}
