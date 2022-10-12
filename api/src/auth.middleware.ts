import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { SESSION_COOKIE_NAME } from './common/constants';
import { GithubService } from './modules/github/github.service';
import { RepoStatsService } from './modules/repoStats/repoStats.service';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly usersService: UsersService,
    private readonly githubService: GithubService,
    private readonly repoStatsService: RepoStatsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies[SESSION_COOKIE_NAME];
    if (!token) {
      const authorization = req.header('authorization');
      token = authorization?.replace('Bearer ', '');
    }

    if (!token) {
      res.sendStatus(401);
      return;
    }

    const jwt = verify(token, process.env.JWT_SECRET);

    const user = await this.usersService.findOne(jwt.sub as string);
    req['token'] = jwt;
    req['user'] = user;

    if (user) {
      this.githubService.auth(user.githubToken);
      this.repoStatsService.auth(user.githubToken);
    }
    next();
  }
}
