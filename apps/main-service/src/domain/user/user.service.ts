import { Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { DatabaseService } from './../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}
  async create(data: CreateUserDto) {
    const hashedPassword = await this.hashPassword(data.password);
    const userData = {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    return await this.databaseService.user.create({
      data: userData,
    });
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
  async findOneOrFailByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}