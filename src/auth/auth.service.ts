import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
        userId: payload.id,
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
        userId: payload,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_exp') ?? '7d',
      },
    );
    return accessToken;
  }
}
