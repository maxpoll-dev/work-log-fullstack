import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { User } from '../../generated/prisma/client';
import { AuthRepository } from './auth.repository';
import { SessionStore } from '../session/session.store';
import type { AuthSession } from './auth-user.types';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly sessions: SessionStore,
  ) {}

  async login(dto: LoginDto): Promise<AuthSession> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.repo.findByEmail(email);
    if (user === null) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS' });
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS' });
    }

    return this.issueSession(user);
  }

  async logout(token: string | undefined): Promise<void> {
    if (token === undefined || token.length === 0) return;
    await this.sessions.destroy(token);
  }

  async me(userId: string) {
    const user = await this.repo.findById(userId);
    if (user === null) throw new UnauthorizedException({ code: 'NO_SESSION' });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role,
    };
  }

  private async issueSession(user: User): Promise<AuthSession> {
    const sessionToken = await this.sessions.create({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      },
      sessionToken,
    };
  }
}
