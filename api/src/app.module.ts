import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthMiddleware } from './auth.middleware';
import { User } from './entities/user.entity';
import { UsersModule } from './modules/users/users.module';
import { Repo } from './entities/repo.entity';
import { Commit } from './entities/commit.entity';
import { SynchronizeModule } from './modules/synchronize/synchronize.module';
import { Issue } from './entities/issue.entity';
import { PullRequest } from './entities/pullrequest.entity';
import { GitProviderModule } from './modules/git-provider/gitprovider.module';
import { RepoModule } from './modules/repo/repo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data.db',
      entities: [User, Repo, Commit, Issue, PullRequest],
      synchronize: true,
      // logging: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    UsersModule,
    GitProviderModule,
    RepoModule,
    SynchronizeModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
