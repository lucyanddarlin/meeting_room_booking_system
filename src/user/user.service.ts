import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, paginateRawAndEntities } from 'nestjs-typeorm-paginate';

import { User } from './entities/User';
import { Role } from './entities/Role';
import { Permission } from './entities/Permission';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { to } from 'src/utils';
import { CAPTCHA_KEY } from 'src/config';
import { UserLoginDto } from './dto/login-user.dto';
import { LoginUserVo, PayLoad } from './vo/user-login.vo';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import { getPaginationOptions } from 'src/utils/paginate';

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
    const passwordVerification = await this.authService.verifyPassword(
      user.password,
      existUser.password,
    );
    if (!passwordVerification) {
      throw new BadRequestException('密码错误');
    }
    const payLoad: PayLoad = {
      id: existUser.id,
      username: existUser.username,
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
    const vo = new LoginUserVo();
    vo.accessToken = this.authService.generateAccessToken(payLoad);
    vo.refreshToken = this.authService.generateRefreshToken(payLoad.id);

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
    const captcha = await this.redisService.get(
      `${CAPTCHA_KEY.user_register}${user.email}`,
    );

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
    const hashedPassword = await this.authService.hashPassword(user.password);
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
   * 修改密码
   * @param userId
   * @param updatePassword
   */
  async updateUserPassword(
    userId: number,
    updatePassword: UpdateUserPasswordDto,
  ) {
    const captcha = await this.redisService.get(
      `${CAPTCHA_KEY.update_password}${updatePassword.email}`,
    );
    if (!captcha) {
      throw new BadRequestException('验证码已失效');
    } else if (captcha !== updatePassword.captcha) {
      throw new BadRequestException('验证码错误');
    }
    const existUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!existUser) {
      throw new BadRequestException('用户不存在');
    }
    existUser.password = await this.authService.hashPassword(
      updatePassword.password,
    );
    const [err] = await to(this.userRepository.save(existUser));
    if (err) {
      throw new BadRequestException('保存用户异常:' + err.message);
    }
    return '修改密码成功';
  }

  /**
   * 修改用户信息
   * @param userId
   * @param updateUserInfo
   */
  async updateUserInfo(userId: number, updateUserInfo: UpdateUserInfoDto) {
    const existUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!existUser) {
      throw new BadRequestException('用户不存在');
    }
    const phone = updateUserInfo?.phone ?? existUser.phone;
    const nickName = updateUserInfo?.nickName ?? existUser.nickName;
    const avatar = updateUserInfo?.avatar ?? existUser.avatar;
    const nextUser: User = { ...existUser, phone, nickName, avatar };
    const [err] = await to(this.userRepository.save(nextUser));
    if (err) {
      throw new BadRequestException('更新用户信息异常:' + err.message);
    }
    return '修改成功';
  }

  /**
   * 冻结用户
   * @param userId
   */
  async updateUserStatus(userId: number, nextStatus: boolean) {
    const existUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!existUser) {
      throw new BadRequestException('用户不存在');
    }
    if (existUser.isFrozen === nextStatus) {
      return '已是目标状态';
    }
    const [err] = await to(
      this.userRepository.save({ ...existUser, isFrozen: nextStatus }),
    );
    if (err) {
      throw new BadRequestException('操作异常');
    }
    return '操作成功';
  }

  /**
   * 获取用户列表
   */
  getUserList() {}

  /**
   * 根据 ID 查询用户(包含对应的角色和权限)
   * @param userId
   * @param isAdmin
   */
  async findUserById(userId: number, isAdmin: boolean): Promise<PayLoad> {
    const existUser = await this.userRepository.findOne({
      where: { id: userId, isAdmin },
      relations: ['roles', 'roles.permissions'],
    });
    if (!existUser) {
      throw new BadRequestException('用户不存在');
    }
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
   * 根据 userId 获取用户信息(部分信息)
   * @param userId
   */
  async findUserDetailById(userId: number) {
    const existUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!existUser) {
      throw new BadRequestException('用户不存在');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, isAdmin, updatedAt, ...rest } = existUser;
    return rest;
  }

  /**
   * 用户的分页(按照 updatedAt 进行排序)
   * @param page
   */
  async paginate(page: number, limit: number) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.orderBy('user.updatedAt', 'DESC');
    const [paginate] = await paginateRawAndEntities(
      queryBuilder,
      getPaginationOptions(page, limit),
    );
    const nextList = paginate.items.map((i) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = i;
      return rest;
    });
    return { list: nextList, meta: paginate.meta };
  }

  /**
   * 开发环境初始化数据
   */
  async devInit() {
    const user1 = new User();
    user1.username = 'darlin';
    user1.password = await this.authService.hashPassword('111111');
    user1.email = 'darlin@xx.com';
    user1.isAdmin = true;
    user1.nickName = 'darlin';
    user1.phone = '13233323333';

    const user2 = new User();
    user2.username = 'lily';
    user2.password = await this.authService.hashPassword('111111');
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
