import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionStore } from './session.store';
import { SESSION_COOKIE } from '../auth/auth.constants';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionStore) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (req.user === undefined) {
      const cookies = req.cookies as
        | Record<string, string | undefined>
        | undefined;
      const token = cookies?.[SESSION_COOKIE];

      if (typeof token === 'string' && token.length > 0) {
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
      }
    }

    if (req.user === undefined) {
      throw new UnauthorizedException({ code: 'NO_SESSION' });
    }

    return true;
  }
}
