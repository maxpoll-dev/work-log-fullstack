import { Global, Module } from '@nestjs/common';
import { SessionStore } from './session.store';
import { SessionGuard } from './session.guard';
import { SessionMiddleware } from './session.middleware';

@Global()
@Module({
  providers: [SessionStore, SessionGuard, SessionMiddleware],
  exports: [SessionStore, SessionGuard, SessionMiddleware],
})
export class SessionModule {}
