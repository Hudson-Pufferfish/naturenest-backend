import { Body, Controller, Get, Put } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserReq } from './../../common/decorator/user.decorator';
import { UserService } from './user.service';
import { Public } from '../../common/decorator/public.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@Controller({ path: '/users', version: '1' })
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get current user information' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the current user information',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          email: 'user@example.com',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('/me')
  getMe(@UserReq() user: User) {
    return user;
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          id: 'clg2h7qxc0000356uk8r9d5g1',
          email: 'user@example.com',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Public()
  @Put('/reset-password')
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.userService.resetPassword(data);
  }
}
