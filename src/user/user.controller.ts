import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/login-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { PayLoadUser } from 'src/decorator/userinfo.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @Public()
  async userLogin(@Body() userLogin: UserLoginDto) {
    return await this.userService.userLogin(userLogin, false);
  }

  @Post('admin/login')
  @Public()
  async adminLogin(@Body() userLogin: UserLoginDto) {
    return await this.userService.userLogin(userLogin, true);
  }

  @Post('register')
  @Public()
  async register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('refresh')
  @Public()
  async refreshToken(@Query('refresh_token') refreshToken: string) {
    return await this.userService.handleRefreshToken(refreshToken);
  }

  @Get('captcha')
  @Public()
  async captcha(@Query('address') address: string) {
    return this.userService.getCaptcha(address);
  }

  @Get('userinfo')
  async getUserInfo(@PayLoadUser('id') userId: number) {
    return await this.userService.findUserDetailById(userId);
  }

  @Post('password/update')
  async updateUserPassword(
    @PayLoadUser('id') userId: number,
    @Body() updateUserPassword: UpdateUserPasswordDto,
  ) {
    console.log(userId, updateUserPassword);
  }

  @Get('dev-init')
  async devInit() {
    return await this.userService.devInit();
  }
}
