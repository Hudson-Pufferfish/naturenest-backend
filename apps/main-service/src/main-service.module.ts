import { Module } from '@nestjs/common';
import { MainServiceController } from './main-service.controller';
import { MainServiceService } from './main-service.service';

@Module({
  imports: [],
  controllers: [MainServiceController],
  providers: [MainServiceService],
})
export class MainServiceModule {}
