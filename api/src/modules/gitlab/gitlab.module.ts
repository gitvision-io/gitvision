import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Module({
  imports: [HttpModule],
  exports: [GitlabService],
  providers: [GitlabService],
  controllers: [],
})
export class GitlabModule {}
