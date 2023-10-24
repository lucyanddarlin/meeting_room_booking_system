import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async userLogin(@Body() userLogin: UserLoginDto) {
    return await this.userService.userLogin(userLogin, false);
  }

  @Post('admin/login')
  async adminLogin(@Body() userLogin: UserLoginDto) {
    return await this.userService.userLogin(userLogin, true);
  }

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('refresh')
  async refreshToken(@Query('refresh_token') refreshToken: string) {
    return await this.userService.handleRefreshToken(refreshToken);
  }

  @Get('captcha')
  async captcha(@Query('address') address: string) {
    return this.userService.getCaptcha(address);
  }

  @Get('dev-init')
  async devInit() {
    return await this.userService.devInit();
  }
}
