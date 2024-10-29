import { Test, TestingModule } from '@nestjs/testing';
import { CronServiceController } from './cron-service.controller';
import { CronServiceService } from './cron-service.service';

describe('CronServiceController', () => {
  let cronServiceController: CronServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CronServiceController],
      providers: [CronServiceService],
    }).compile();

    cronServiceController = app.get<CronServiceController>(CronServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cronServiceController.getHello()).toBe('Hello World!');
    });
  });
});
