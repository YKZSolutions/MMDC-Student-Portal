import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export type RequestWithId = Request & { id?: string };

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { id?: string }, res: Response, next: NextFunction) {
    // Express's getter returns string | undefined
    const incomingId = req.get('x-request-id');

    req.id = incomingId ?? randomUUID();

    res.setHeader('X-Request-ID', req.id);
    next();
  }
}
