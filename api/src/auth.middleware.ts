import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header('authorization');
    if (!authorization) {
      res.sendStatus(401);
      return;
    }

    const token = authorization.replace('Bearer ', '');
    const jwt = verify(token, process.env.JWT_SECRET);
    res.locals.token = jwt;

    next();
  }
}
