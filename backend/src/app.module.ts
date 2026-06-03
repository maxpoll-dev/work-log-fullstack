import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema';
import { PrismaModule } from './prisma/prisma.module';
import { SessionModule } from './session/session.module';
import { SessionMiddleware } from './session/session.middleware';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { JournalModule } from './work/journal/journal.module';
import { TypesModule } from './work/types/types.module';
import { UnitsModule } from './work/units/units.module';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';

@Module({
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    // Rate limit
    ThrottlerModule.forRoot([
      { name: 'short', ttl: seconds(60), limit: 100 },
      { name: 'long', ttl: seconds(3600), limit: 1000 },
    ]),

    // Core
    HealthModule,
    PrismaModule,

    // Domains
    SessionModule,
    AuthModule,
    JournalModule,
    TypesModule,
    UnitsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
