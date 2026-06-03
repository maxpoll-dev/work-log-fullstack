import { Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const TRACE_ID_HEADER = 'x-trace-id';

declare module 'express-serve-static-core' {
  interface Request {
    traceId?: string;
  }
}

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header(TRACE_ID_HEADER);
    const traceId = incoming && incoming.length > 0 ? incoming : randomUUID();

    req.traceId = traceId;
    res.setHeader(TRACE_ID_HEADER, traceId);
    next();
  }
}
