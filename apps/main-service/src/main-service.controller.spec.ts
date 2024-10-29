import { Test, TestingModule } from '@nestjs/testing';
import { MainServiceController } from './main-service.controller';
import { MainServiceService } from './main-service.service';

describe('MainServiceController', () => {
  let mainServiceController: MainServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MainServiceController],
      providers: [MainServiceService],
    }).compile();

    mainServiceController = app.get<MainServiceController>(MainServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mainServiceController.getHello()).toBe('Hello World!');
    });
  });
});
