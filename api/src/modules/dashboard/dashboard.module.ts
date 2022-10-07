import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [],
  exports: [DashboardService],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
