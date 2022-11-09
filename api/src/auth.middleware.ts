import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GitProviderService } from './modules/git-provider/gitprovider.service';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly usersService: UsersService,
    private readonly gitProviderService: GitProviderService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = await this.usersService.findOne('user');
    req['user'] = user;

    if (user) {
      this.gitProviderService.auth(user.gitProviderName, user.gitProviderToken);
    }
    next();
  }
}
