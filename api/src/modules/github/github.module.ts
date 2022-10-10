import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

@Module({
  imports: [],
  exports: [GithubService],
  providers: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}
