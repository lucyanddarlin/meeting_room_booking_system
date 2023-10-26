import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: '密码非空提示' })
  @MinLength(6, { message: '密码不少于 6 位' })
  password: string;

  @IsNotEmpty({ message: '邮箱非空提示' })
  @IsEmail({}, { message: '邮箱格式错误' })
  email: string;

  @IsNotEmpty({ message: '验证码非空提示' })
  captcha: string;
}
