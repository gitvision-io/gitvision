import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('orgs')
  async getOrgs(): Promise<{ id: number; login: string }[]> {
    return await this.dashboardService.getOrgs();
  }
}
