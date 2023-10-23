import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class RegisterUserDto {
  @IsNotEmpty({ message: '用户名非空提示' })
  username: string;

  @IsNotEmpty({ message: '昵称非空提示' })
  nickName: string;

  @IsNotEmpty({ message: '密码非空提示' })
  @MinLength(6, { message: '密码不能少于 6 位' })
  password: string;

  @IsNotEmpty({ message: '邮箱非空提示' })
  @IsEmail({}, { message: '邮箱格式错误' })
  email: string;

  @IsNotEmpty({ message: '验证码非空提示' })
  captcha: string;
}
