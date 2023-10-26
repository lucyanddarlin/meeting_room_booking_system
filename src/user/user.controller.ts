import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/login-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { PayLoadUser } from 'src/decorator/userinfo.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import { MQuery } from 'src/decorator/mquery.decorator';
import { USER_FREEZE_STATUS, defaultPaginationParams } from 'src/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUserVo } from './vo/user-login.vo';
import { UserDetailVo } from './vo/user-detail.vo';
import { UserListVo } from './vo/user-list.vo';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '普通用户登陆' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginUserVo,
  })
  @Post('login')
  @Public()
  async userLogin(@Body() userLogin: UserLoginDto) {
    return await this.userService.userLogin(userLogin, false);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginUserVo,
  })
  @ApiOperation({ summary: '管理员用户登陆' })
  @Post('admin/login')
  @Public()
  async adminLogin(@Body() userLogin: UserLoginDto) {
    return await this.userService.userLogin(userLogin, true);
  }

  @ApiOperation({ summary: '用户注册' })
  @Post('register')
  @Public()
  async register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @ApiOperation({ summary: 'Token 的刷新' })
  @ApiQuery({
    name: 'refresh_token',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginUserVo,
  })
  @Get('refresh')
  @Public()
  async refreshToken(@Query('refresh_token') refreshToken: string) {
    return await this.userService.handleRefreshToken(refreshToken);
  }

  @ApiOperation({ summary: '获取用户信息' })
  @ApiQuery({ name: 'id', required: true })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserDetailVo,
  })
  @Get('userinfo')
  async getUserInfo(@PayLoadUser('id') userId: number) {
    return await this.userService.findUserDetailById(userId);
  }

  @ApiOperation({ summary: '修改密码' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: '修改用户信息' })
  @ApiBearerAuth()
  @Post('userinfo/update')
  async updateUserInfo(
    @PayLoadUser('id') userId: number,
    @Body() updateUserInfo: UpdateUserInfoDto,
  ) {
    return await this.userService.updateUserInfo(userId, updateUserInfo);
  }

  @ApiOperation({ summary: '冻结用户' })
  @ApiQuery({ name: 'id', required: true })
  @ApiBearerAuth()
  @Get('freeze')
  async freezeUser(@MQuery('id') userId: number) {
    return await this.userService.updateUserStatus(
      userId,
      USER_FREEZE_STATUS.Frozen,
    );
  }

  @ApiOperation({ summary: '解冻用户' })
  @ApiQuery({ name: 'id', required: true })
  @ApiBearerAuth()
  @Get('unfreeze')
  async unFreezeUser(@MQuery('id') userId: number) {
    return await this.userService.updateUserStatus(
      userId,
      USER_FREEZE_STATUS.UnFrozen,
    );
  }

  @ApiOperation({ summary: '用户列表分页(根据更新时间排序)' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserListVo,
  })
  @Get('list')
  async getUserList(
    @Query(
      'page',
      new DefaultValuePipe(defaultPaginationParams.currentPage),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(defaultPaginationParams.pageSize),
      ParseIntPipe,
    )
    limit: number,
  ) {
    return await this.userService.paginate(page, limit);
  }

  @Get('dev-init')
  async devInit() {
    return await this.userService.devInit();
  }
}
