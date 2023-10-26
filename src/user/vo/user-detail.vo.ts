import { ApiProperty } from '@nestjs/swagger';

export class UserDetailVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  createdAt: Date;
}
