import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { randomBytes } from 'node:crypto';
import type { UserRole } from '../../generated/prisma/client';
import type { Env } from '../config/env.schema';
import {
  SESSION_REDIS_PREFIX,
  SESSION_USER_INDEX_PREFIX,
} from '../auth/auth.constants';

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

@Injectable()
export class SessionStore implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionStore.name);
  private readonly redis: Redis;
  private readonly ttlSeconds: number;

  constructor(config: ConfigService<Env, true>) {
    this.redis = new Redis(config.get('REDIS_URL', { infer: true }), {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    this.ttlSeconds = config.get('SESSION_TTL_SECONDS', { infer: true });
  }

  get ttl(): number {
    return this.ttlSeconds;
  }

  async create(data: Omit<SessionData, 'createdAt'>): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const payload: SessionData = { ...data, createdAt: Date.now() };

    const pipeline = this.redis.multi();
    pipeline.setex(
      this.sessionKey(token),
      this.ttlSeconds,
      JSON.stringify(payload),
    );
    pipeline.sadd(this.userKey(data.userId), token);
    pipeline.expire(this.userKey(data.userId), this.ttlSeconds);

    await pipeline.exec();
    return token;
  }

  async get(token: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.sessionKey(token));
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as SessionData;
    } catch {
      await this.redis.del(this.sessionKey(token));
      return null;
    }
  }

  async touch(token: string, userId: string): Promise<void> {
    const pipeline = this.redis.multi();

    pipeline.expire(this.sessionKey(token), this.ttlSeconds);
    pipeline.expire(this.userKey(userId), this.ttlSeconds);

    await pipeline.exec();
  }

  async destroy(token: string): Promise<void> {
    const data = await this.get(token);
    const pipeline = this.redis.multi();

    pipeline.del(this.sessionKey(token));

    if (data !== null) {
      pipeline.srem(this.userKey(data.userId), token);
    }

    await pipeline.exec();
  }

  private sessionKey(token: string): string {
    return `${SESSION_REDIS_PREFIX}${token}`;
  }

  private userKey(userId: string): string {
    return `${SESSION_USER_INDEX_PREFIX}${userId}`;
  }

  async ping(): Promise<void> {
    const res = await this.redis.ping();

    if (res !== 'PONG') {
      throw new Error(`Unexpected Redis ping response: ${res as 'PONG'}`);
    }
  }

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
    this.logger.log('SessionStore Redis connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
