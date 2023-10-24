import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('captcha')
  async captcha(@Query('address') address: string) {
    return this.userService.getCaptcha(address);
  }
}
