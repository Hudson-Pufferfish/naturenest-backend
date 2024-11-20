import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { DatabaseService } from './../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}
  async create(data: CreateUserDto) {
    const existingEmail = await this.databaseService.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUsername = await this.databaseService.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

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

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.databaseService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('No user found with this email');
    }

    if (user.username !== data.username) {
      throw new BadRequestException('Username does not match with the email');
    }

    if (data.newPassword !== data.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await this.hashPassword(data.newPassword);

    return await this.databaseService.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}
