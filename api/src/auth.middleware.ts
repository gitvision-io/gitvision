import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly usersService: UsersService,
    private readonly dashboardService: DashboardService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies['next-auth.session-token'];
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
    res.locals.token = jwt;
    res.locals.user = user;

    if (user) {
      this.dashboardService.auth(user.githubToken);
    }

    next();
  }
}
