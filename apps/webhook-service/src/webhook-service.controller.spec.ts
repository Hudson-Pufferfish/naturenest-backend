import { Test, TestingModule } from '@nestjs/testing';
import { WebhookServiceController } from './webhook-service.controller';
import { WebhookServiceService } from './webhook-service.service';

describe('WebhookServiceController', () => {
  let webhookServiceController: WebhookServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebhookServiceController],
      providers: [WebhookServiceService],
    }).compile();

    webhookServiceController = app.get<WebhookServiceController>(WebhookServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(webhookServiceController.getHello()).toBe('Hello World!');
    });
  });
});
