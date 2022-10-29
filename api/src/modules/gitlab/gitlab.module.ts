import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Module({
  imports: [],
  exports: [GitlabService],
  providers: [GitlabService],
  controllers: [],
})
export class GitlabModule {}
