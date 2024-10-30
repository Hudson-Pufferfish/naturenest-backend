import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { PropertyModule } from './property/property.module';
import { ReservationModule } from './reservation/reservation.module';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
@Module({
  imports: [
    UserModule,
    AuthModule,
    CategoryModule,
    PropertyModule,
    ReservationModule,
  ],
})
export class DomainModule {}
