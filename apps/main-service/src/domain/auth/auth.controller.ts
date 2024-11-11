import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // TODO: swagger
  @Public()
  @Post('sign-in')
  signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data.email, data.password);
  }

  @Public()
  @Post('register')
  register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }
}
