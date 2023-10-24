import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Role } from './entities/Role';
import { Permission } from './entities/Permission';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
