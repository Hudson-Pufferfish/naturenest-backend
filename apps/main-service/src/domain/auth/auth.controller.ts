import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Sign in a user' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'clg2h7qxc0000356uk8r9d5g1',
            email: 'user@example.com',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post('sign-in')
  signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data.email, data.password);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'clg2h7qxc0000356uk8r9d5g1',
            email: 'user@example.com',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post('register')
  register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }
}
