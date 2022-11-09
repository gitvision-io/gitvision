import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { All, Controller, Next, Request, Response } from '@nestjs/common';
import * as Bull from 'bull';
import express from 'express';
import {
  CRON_SYNCHRONIZATION_QUEUE,
  PUBLIC_SYNCHRONIZATION_QUEUE,
  USER_SYNCHRONIZATION_QUEUE,
} from './synchronize.constants';

const rootPath = '/api/bull/admin/';

@Controller(rootPath)
export class QueueAdminController {
  @All('*')
  admin(
    @Request() req: express.Request,
    @Response() res: express.Response,
    @Next() next: express.NextFunction,
  ) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(rootPath);
    const queues = [
      USER_SYNCHRONIZATION_QUEUE,
      CRON_SYNCHRONIZATION_QUEUE,
      PUBLIC_SYNCHRONIZATION_QUEUE,
    ].map(
      (queue) =>
        new Bull(queue, {
          redis: {
            port: parseInt(process.env.REDIS_PORT),
            host: process.env.REDIS_HOST,
            password: process.env.REDIS_PASSWORD,
          },
        }),
    );
    const router = serverAdapter.getRouter() as express.Express;
    createBullBoard({
      queues: [...queues.map((q) => new BullAdapter(q))],
      serverAdapter,
    });
    req.url = req.url.replace(rootPath, '/');
    router(req, res, next);
  }
}
