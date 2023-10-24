import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './Role';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    length: 50,
    comment: '昵称',
  })
  nickName: string;

  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  avatar: string;

  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phone: string;

  @Column({
    comment: '是否冻结',
    default: false,
  })
  isFrozen: boolean;

  @Column({
    comment: '是否为管理员',
    default: false,
  })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_role' })
  roles: Array<Role>;
}
