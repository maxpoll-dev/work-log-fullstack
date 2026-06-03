import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SessionStore } from './session.store';
import { SESSION_COOKIE } from '../auth/auth.constants';
import type { AuthenticatedUser } from '../auth/auth-user.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    sessionToken?: string;
  }
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);

  constructor(private readonly sessions: SessionStore) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const cookies = req.cookies as
      | Record<string, string | undefined>
      | undefined;
    const token = cookies?.[SESSION_COOKIE];

    if (typeof token !== 'string' || token.length === 0) {
      next();
      return;
    }

    try {
      const session = await this.sessions.get(token);

      if (session !== null) {
        await this.sessions.touch(token, session.userId);

        req.user = {
          id: session.userId,
          email: session.email,
          role: session.role,
        };
        req.sessionToken = token;
      }
    } catch (err) {
      this.logger.warn(`session resolve failed: ${String(err)}`);
    }

    next();
  }
}
