import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  register(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }
}
