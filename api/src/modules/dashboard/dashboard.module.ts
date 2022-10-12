import { Module } from '@nestjs/common';
import { SynchronizeModule } from '../synchronize/synchronize.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [SynchronizeModule],
  exports: [DashboardService],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
