import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const foundUser = await this.userService.findOneOrFailByEmail(email);
    const isMatched = await this.userService.comparePassword(
      password,
      foundUser.password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: foundUser.id,
      email: foundUser.email,
    };

    const jwt = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      jwt,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
      },
    };
  }

  async register(data: CreateUserDto) {
    if (data.password !== data.password2) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userService.create(data);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const jwt = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      jwt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
