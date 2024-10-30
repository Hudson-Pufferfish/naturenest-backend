import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
@Module({
  imports: [UserModule, AuthModule],
})
export class DomainModule {}
