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

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new BadRequestException('验证码已失效');
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
}
