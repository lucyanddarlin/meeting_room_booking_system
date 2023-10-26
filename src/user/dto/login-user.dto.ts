import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: '用户名非空提示' })
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: '密码非空提示' })
  password: string;
}
