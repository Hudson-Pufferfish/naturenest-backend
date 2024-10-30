import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserReq } from './../../common/decorator/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

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
}
