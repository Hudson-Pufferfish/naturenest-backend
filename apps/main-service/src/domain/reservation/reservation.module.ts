import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [PropertyModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
