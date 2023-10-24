import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/User';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { to } from 'src/utils';
import { EmailService } from 'src/email/email.service';

/**
 * bcrypt 加盐轮数
 */
const saltRounds = 10;

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  /**
   * 用户注册
   * @param user
   */
  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new BadRequestException('验证码已失效');
    } else if (captcha !== user.captcha) {
      throw new BadRequestException('验证码错误');
    }

    const existUser = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (existUser) {
      throw new BadRequestException('用户名已存在');
    }

    const nextUser = new User();
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    nextUser.username = user.username;
    nextUser.password = hashedPassword;
    nextUser.nickName = user.nickName;
    nextUser.email = user.email;

    const [err] = await to(this.userRepository.save(nextUser));

    if (err) {
      this.logger.error(err, UserService);
      throw new BadRequestException('注册异常');
    }
    return '注册成功';
  }

  /**
   * 获取验证码
   */
  async getCaptcha(address: string) {
    const captchaCode = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, captchaCode, 60);

    const [err] = await to(
      this.emailService.sendCaptcha({
        to: address,
        subject: '注册验证码',
        html: `<p>你的验证码是 ${captchaCode}</p>`,
      }),
    );
    if (err) {
      throw new BadRequestException(JSON.stringify(err));
    }
    return '验证码发送成功';
  }
}
