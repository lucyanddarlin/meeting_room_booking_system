import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/User';
import { CustomPaginationMeta } from 'src/utils';

export class UserListVo {
  @ApiProperty({ type: [User] })
  list: Array<Omit<User, 'password'>>;

  @ApiProperty()
  meta: CustomPaginationMeta;
}
