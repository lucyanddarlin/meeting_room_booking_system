import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CAPTCHA_BEGIN_INDEX,
  CAPTCHA_END_INDEX,
  CAPTCHA_EXPIRE_TIME,
  CAPTCHA_KEY,
} from 'src/config';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { to } from 'src/utils';

@Injectable()
export class CaptchaService {
  constructor() {}

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  /**
   * 获取用户注册的验证码
   */
  async getUserRegisterCaptcha(address: string) {
    if (!this._verifyEmail(address)) {
      throw new BadRequestException('邮箱格式错误');
    }
    return await this._sendCaptchaCodeByKey(
      CAPTCHA_KEY.user_register,
      address,
      '注册验证码',
    );
  }

  /**
   * 验证邮箱格式
   * @param address
   */
  _verifyEmail(address: string): boolean {
    const regex = /^[a-zA-Z0-9_-].+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return regex.test(address);
  }

  /**
   * 随机生成 6 位的验证码
   */
  _generateCaptchaCode(): string {
    return Math.random()
      .toString()
      .slice(CAPTCHA_BEGIN_INDEX, CAPTCHA_END_INDEX);
  }

  /**
   * 发送验证码
   * @param captchaKey
   * @param address
   * @param subject
   */
  async _sendCaptchaCodeByKey(
    captchaKey: CAPTCHA_KEY,
    address: string,
    subject?: string,
  ) {
    const captchaCode = this._generateCaptchaCode();
    await this.redisService.set(
      `${captchaKey}${address}`,
      captchaCode,
      CAPTCHA_EXPIRE_TIME,
    );

    const [err] = await to(
      this.emailService.sendCaptcha({
        to: address,
        subject,
        html: `<p>你的验证码是 ${captchaCode}</p>`,
      }),
    );

    if (err) {
      throw new BadRequestException(JSON.stringify(err));
    }
    return '验证码发送成功';
  }
}
