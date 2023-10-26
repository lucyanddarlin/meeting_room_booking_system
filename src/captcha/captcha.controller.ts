import { Controller, Get, Inject } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { CaptchaService } from './captcha.service';
import { MQuery } from 'src/decorator/mquery.decorator';

@ApiTags('验证码模块')
@Controller('captcha')
export class CaptchaController {
  @Inject(CaptchaService)
  private readonly captchaService: CaptchaService;

  @ApiOperation({ summary: '用户注册验证码的获取' })
  @ApiQuery({ name: 'address', required: true, example: 'lucy.li@quectel.com' })
  @Get('user/register')
  @Public()
  getUserRegisterCaptcha(@MQuery('address') address: string) {
    return this.captchaService.getUserRegisterCaptcha(address);
  }

  @ApiOperation({ summary: '用户修改密码验证码的获取' })
  @ApiQuery({ name: 'address', required: true, example: 'lucy.li@quectel.com' })
  @ApiBearerAuth()
  @Get('password/update')
  async getUpdatePasswordCaptcha(@MQuery('address') address: string) {
    return await this.captchaService.getUpdatePasswordCaptcha(address);
  }
}
