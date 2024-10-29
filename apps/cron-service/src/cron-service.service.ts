import { Injectable } from '@nestjs/common';

@Injectable()
export class CronServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
