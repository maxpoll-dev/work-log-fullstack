import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SessionStore } from '../session/session.store';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('healthz')
export class HealthController {
  constructor(private readonly sessions: SessionStore) {}

  @Get()
  @SkipThrottle()
  async check() {
    try {
      await this.sessions.ping();
    } catch {
      throw new ServiceUnavailableException({ status: 'error', redis: 'down' });
    }

    return { status: 'ok', redis: 'up' };
  }
}
