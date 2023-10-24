import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorator/public.decorator';
import { Permission } from './decorator/permission.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Permission('ccc')
  getHello(): string {
    return this.appService.getHello();
  }
}
