import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SALT_ROUNDS } from 'src/config';
import { PayLoad } from 'src/user/vo/user-login.vo';

interface VerifyRefreshTokenResult {
  userId: number;
  isAdmin: boolean;
}

@Injectable()
export class AuthService {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  /**
   * 加密密码
   * @param password
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * 验证密码
   * @param password 明文密码
   * @param hashPassword 加密密码
   */
  async verifyPassword(password: string, hashPassword): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  /**
   * 验证 refreshToken
   * @param refreshToken
   */
  verifyRefreshToken(refreshToken: string): VerifyRefreshTokenResult {
    const verifyData =
      this.jwtService.verify<VerifyRefreshTokenResult>(refreshToken);
    return verifyData;
  }

  /**
   * 生成 access token
   * @param payload
   */
  generateAccessToken(payload: PayLoad): string {
    const accessToken = this.jwtService.sign(
      {
        id: payload.id,
        username: payload.username,
        roles: payload.roles,
        permissions: payload.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_exp') ?? '30m',
      },
    );
    return accessToken;
  }

  /**
   * 生成 refresh token
   * @param payload
   */
  generateRefreshToken(payload: number): string {
    const accessToken = this.jwtService.sign(
      {
        id: payload,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_exp') ?? '7d',
      },
    );
    return accessToken;
  }
}
