import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/login-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { PayLoadUser } from 'src/decorator/userinfo.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import { MQuery } from 'src/decorator/mquery.decorator';
import { USER_FREEZE_STATUS } from 'src/config';

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

  @Get('userinfo')
  async getUserInfo(@PayLoadUser('id') userId: number) {
    return await this.userService.findUserDetailById(userId);
  }

  @Post('password/update')
  async updateUserPassword(
    @PayLoadUser('id') userId: number,
    @Body() updateUserPassword: UpdateUserPasswordDto,
  ) {
    return await this.userService.updateUserPassword(
      userId,
      updateUserPassword,
    );
  }

  @Post('userinfo/update')
  async updateUserInfo(
    @PayLoadUser('id') userId: number,
    @Body() updateUserInfo: UpdateUserInfoDto,
  ) {
    return await this.userService.updateUserInfo(userId, updateUserInfo);
  }

  @Get('freeze')
  async freezeUser(@MQuery('id') userId: number) {
    return await this.userService.updateUserStatus(
      userId,
      USER_FREEZE_STATUS.Frozen,
    );
  }

  @Get('unfreeze')
  async unFreezeUser(@MQuery('id') userId: number) {
    return await this.userService.updateUserStatus(
      userId,
      USER_FREEZE_STATUS.UnFrozen,
    );
  }

  @Get('dev-init')
  async devInit() {
    return await this.userService.devInit();
  }
}
