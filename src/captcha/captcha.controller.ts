import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from 'src/decorator/public.decorator';
import { CaptchaService } from './captcha.service';
import { MQuery } from 'src/decorator/mquery.decorator';

@Controller('captcha')
export class CaptchaController {
  @Inject(CaptchaService)
  private readonly captchaService: CaptchaService;

  @Get('user/register')
  @Public()
  getUserRegisterCaptcha(@MQuery('address') address: string) {
    return this.captchaService.getUserRegisterCaptcha(address);
  }

  @Get('password/update')
  async getUpdatePasswordCaptcha(@MQuery('address') address: string) {
    return await this.captchaService.getUpdatePasswordCaptcha(address);
  }
}
