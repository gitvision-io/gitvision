import { Module } from '@nestjs/common';
import { GithubService } from './github.service';

@Module({
  imports: [],
  exports: [GithubService],
  providers: [GithubService],
  controllers: [],
})
export class GithubModule {}
