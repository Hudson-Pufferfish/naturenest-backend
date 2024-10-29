import { Controller, Get } from '@nestjs/common';
import { MainServiceService } from './main-service.service';

@Controller()
export class MainServiceController {
  constructor(private readonly mainServiceService: MainServiceService) {}

  @Get()
  getHello(): string {
    return this.mainServiceService.getHello();
  }
}
