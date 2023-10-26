import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoDto {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  avatar: string;
}
