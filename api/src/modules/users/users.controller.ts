import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UsersService } from './users.service';

export class UserTokenDTO {
  githubId: string;
  githubToken: string;
}

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Put(':id/token')
  async setToken(
    @Param('id') id: string,
    @Body() userToken: UserTokenDTO,
  ): Promise<string> {
    await this.usersService.updateGithubInfos(
      id,
      userToken.githubId,
      userToken.githubToken,
    );
    return 'ok';
  }
}
