import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/User';
import { Role } from './entities/Role';
import { Permission } from './entities/Permission';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { to } from 'src/utils';
import { EmailService } from 'src/email/email.service';
import {
  CAPTCHA_BEGIN_INDEX,
  CAPTCHA_END_INDEX,
  CAPTCHA_EXPIRE_TIME,
  SALT_ROUNDS,
} from 'src/config';
import { UserLoginDto } from './dto/login-user.dto';
import { LoginUserVo, PayLoad } from './vo/user-login.vo';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(AuthService)
  private readonly authService: AuthService;

  /**
   * 用户登陆
   * @param user
   * @param isAdmin 是否为管理员登陆
   */
  async userLogin(user: UserLoginDto, isAdmin: boolean): Promise<LoginUserVo> {
    const existUser = await this.userRepository.findOne({
      where: { username: user.username, isAdmin },
      relations: ['roles', 'roles.permissions'],
    });
    if (!existUser) {
      throw new BadRequestException('用户名不存在');
    }
    const passwordVerification = bcrypt.compareSync(
      user.password,
      existUser.password,
    );
    if (!passwordVerification) {
      throw new BadRequestException('密码错误');
    }
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: existUser.id,
      username: existUser.username,
      nickName: existUser.nickName,
      email: existUser.email,
      phone: existUser.phone,
      avatar: existUser.avatar,
      isFrozen: existUser.isFrozen,
      isAdmin: existUser.isAdmin,
      roles: existUser.roles.map((r) => r.name),
      permissions: existUser.roles.reduce((arr, cur) => {
        cur.permissions.forEach((p) => {
          if (arr.indexOf(p) === -1) {
            arr.push(p);
          }
        });
        return arr;
      }, []),
      createdAt: existUser.createdAt,
    };

    vo.accessToken = this.authService.generateAccessToken(vo.userInfo);
    vo.refreshToken = this.authService.generateRefreshToken(vo.userInfo.id);

    return vo;
  }

  /**
   * refreshToken 逻辑
   */
  async handleRefreshToken(refreshToken: string) {
    try {
      const verifyData = this.authService.verifyRefreshToken(refreshToken);

      const existUser = await this.findUserById(
        verifyData.userId,
        verifyData.isAdmin,
      );

      const nextAccessToken = this.authService.generateAccessToken(existUser);
      const nextRefreshToken = this.authService.generateRefreshToken(
        existUser.id,
      );

      return {
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('token 已失效');
    }
  }

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
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
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
   * 根据 ID 查询用户
   * @param userId
   * @param isAdmin
   */
  async findUserById(userId: number, isAdmin: boolean): Promise<PayLoad> {
    const existUser = await this.userRepository.findOne({
      where: { id: userId, isAdmin },
      relations: ['roles', 'roles.permissions'],
    });
    return {
      id: existUser.id,
      username: existUser.username,
      isAdmin: existUser.isAdmin,
      roles: existUser.roles.map((r) => r.name),
      permissions: existUser.roles.reduce((arr, cur) => {
        cur.permissions.forEach((p) => {
          if (arr.indexOf(p) === -1) {
            arr.push(p);
          }
        });
        return arr;
      }, []),
    };
  }

  /**
   * 获取验证码
   */
  async getCaptcha(address: string) {
    const captchaCode = Math.random()
      .toString()
      .slice(CAPTCHA_BEGIN_INDEX, CAPTCHA_END_INDEX);

    await this.redisService.set(
      `captcha_${address}`,
      captchaCode,
      CAPTCHA_EXPIRE_TIME,
    );

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

  /**
   * 开发环境初始化数据
   */
  async devInit() {
    const user1 = new User();
    user1.username = 'darlin';
    user1.password = await bcrypt.hash('111111', SALT_ROUNDS);
    user1.email = 'darlin@xx.com';
    user1.isAdmin = true;
    user1.nickName = 'darlin';
    user1.phone = '13233323333';

    const user2 = new User();
    user2.username = 'lily';
    user2.password = await bcrypt.hash('111111', SALT_ROUNDS);
    user2.email = 'lily@yy.com';
    user2.nickName = 'lily';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);

    return 'init successfully';
  }
}
