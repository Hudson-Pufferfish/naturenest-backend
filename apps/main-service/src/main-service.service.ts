import { Injectable } from '@nestjs/common';

@Injectable()
export class MainServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
