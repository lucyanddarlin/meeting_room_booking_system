import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './Role';

@Entity({ name: 'users' })
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    length: 50,
    comment: '用户名',
  })
  username: string;

  @Column({
    length: 200,
    comment: '密码',
  })
  password: string;

  @ApiProperty()
  @Column({
    length: 50,
    comment: '昵称',
  })
  nickName: string;

  @ApiProperty()
  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @ApiProperty()
  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  avatar: string;

  @ApiProperty()
  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phone: string;

  @ApiProperty()
  @Column({
    comment: '是否冻结',
    default: false,
  })
  isFrozen: boolean;

  @ApiProperty()
  @Column({
    comment: '是否为管理员',
    default: false,
  })
  isAdmin: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_role' })
  roles: Array<Role>;
}
