import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthMiddleware } from './auth.middleware';
import { User } from './entities/user.entity';
import { UsersModule } from './modules/users/users.module';
import { GithubModule } from './modules/github/github.module';
import { RepoModule } from './modules/repo/repo.module';
import { Repo } from './entities/repo.entity';
import { Commit } from './entities/commit.entity';
import { SynchronizeModule } from './modules/synchronize/synchronize.module';
import { Issue } from './entities/issue.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data.db',
      entities: [User, Repo, Commit, Issue],
      synchronize: true,
    }),
    BullModule.forRoot({
      redis: {
        host: '35.229.90.134',
        port: 6379,
        password: 'Pgr68UFuqCPcLx',
      },
    }),
    UsersModule,
    GithubModule,
    RepoModule,
    SynchronizeModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
