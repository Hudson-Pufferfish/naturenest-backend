import { Module } from '@nestjs/common';
import { AmenityController } from './amenity.controller';
import { AmenityService } from './amenity.service';

@Module({
  controllers: [AmenityController],
  providers: [AmenityService],
})
export class AmenityModule {}
