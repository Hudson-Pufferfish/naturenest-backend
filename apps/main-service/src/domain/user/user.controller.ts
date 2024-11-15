import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserReq } from './../../common/decorator/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Public } from '../../common/decorator/public.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  register(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Get('/me')
  getMe(@UserReq() user: User) {
    return user;
  }

  @Public()
  @Put('/reset-password')
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.userService.resetPassword(data);
  }
}
