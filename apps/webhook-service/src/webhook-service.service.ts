import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
