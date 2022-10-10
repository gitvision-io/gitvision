import { Body, Controller, Delete, Get, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { DashboardService } from '../dashboard/dashboard.service';
import { USER } from './users.decorator';
import { UserDTO, UserProfileDTO } from './users.dto';
import { UsersService } from './users.service';

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('me')
  async getUser(@USER() user: User): Promise<User> {
    return await this.usersService.findOne(user.id);
  }

  @Put('me')
  async setUser(
    @Req() request: Request,
    @Body() userDto: UserDTO,
  ): Promise<{ status: string }> {
    await this.usersService.upsert(request['token'].sub, userDto);
    return { status: 'ok' };
  }

  @Put('me/profile')
  async setUserProfile(
    @Req() request: Request,
    @Body() userProfileDto: UserProfileDTO,
  ): Promise<{ status: string }> {
    await this.usersService.updateProfile(request['token'].sub, userProfileDto);
    return { status: 'ok' };
  }

  @Delete('me/github')
  async deleteGithubAccess(
    @USER() user: User,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    await this.dashboardService.revokeAccess(user.githubToken);
    await this.usersService.update(request['token'].sub, {
      githubId: null,
      githubToken: null,
    });
    return { status: 'ok' };
  }
}