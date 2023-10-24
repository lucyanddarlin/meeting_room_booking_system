import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty({ message: '用户名非空提示' })
  username: string;

  @IsNotEmpty({ message: '密码非空提示' })
  password: string;
}
