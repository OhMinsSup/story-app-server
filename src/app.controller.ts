import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggedInGuard } from './auth/logged-in.guard';
import { User } from './decorators/get-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(LoggedInGuard)
  getHello(@User() user): string {
    console.log(user);
    return this.appService.getHello();
  }
}
