import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth.middleware';
import { User } from './entities/user.entity';
import { UsersModule } from './modules/users/users.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GithubModule } from './modules/github/github.module';
import { RepoStatsModule } from './modules/repoStats/repoStats.module';
import { RepoStats } from './entities/repoStats.entity';
import { UserRepoStats } from './entities/userRepoStats.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data.db',
      entities: [User, RepoStats, UserRepoStats],
      synchronize: true,
    }),
    UsersModule,
    DashboardModule,
    GithubModule,
    RepoStatsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
