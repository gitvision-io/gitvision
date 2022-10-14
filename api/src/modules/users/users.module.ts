import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/entities/user.entity';
import { GithubModule } from '../github/github.module';
import { RepoModule } from '../repo/repo.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GithubModule, RepoModule],
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
