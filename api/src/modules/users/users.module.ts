import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/entities/user.entity';
import { GitProviderModule } from '../git-provider/gitprovider.module';
import { RepoModule } from '../repo/repo.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GitProviderModule, RepoModule],
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
