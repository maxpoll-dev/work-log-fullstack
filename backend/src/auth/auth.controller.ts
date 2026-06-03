import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthService } from './auth.service';
import { SessionStore } from '../session/session.store';
import { SessionGuard } from '../session/session.guard';
import { CurrentUser } from './current-user.decorator';
import { SESSION_COOKIE, SESSION_COOKIE_PATH } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { MeResponseDto } from './dto/me.response.dto';
import { seconds, Throttle } from '@nestjs/throttler';

import type { Env } from '../config/env.schema';
import type { AuthenticatedUser, AuthSession } from './auth-user.types';
import type { CookieOptions, Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionStore,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('login')
  @Throttle({
    short: { ttl: seconds(60), limit: 3 },
    long: { ttl: seconds(3600), limit: 10 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'authLogin',
    summary: 'Авторизует пользователя по email и паролю',
  })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Сессия выдана' })
  @ApiUnauthorizedResponse({ description: 'INVALID_CREDENTIALS' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.auth.login(dto);
    this.setSessionCookie(res, session.sessionToken);

    return this.toResponse(session);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  @ApiOperation({ operationId: 'authMe', summary: 'Текущий пользователь' })
  @ApiOkResponse({ type: MeResponseDto })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    const me = await this.auth.me(user.id);
    return plainToInstance(MeResponseDto, me, {
      excludeExtraneousValues: true,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'authLogout',
    summary: 'Удаляет сессию и очищает куки',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies = req.cookies as
      | Record<string, string | undefined>
      | undefined;
    await this.auth.logout(cookies?.[SESSION_COOKIE]);

    this.clearSessionCookie(res);
  }

  private setSessionCookie(res: Response, token: string): void {
    const options: CookieOptions = {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      sameSite: 'lax',
      maxAge: this.sessions.ttl * 1000,
      path: SESSION_COOKIE_PATH,
    };
    res.cookie(SESSION_COOKIE, token, options);
  }

  private clearSessionCookie(res: Response): void {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      sameSite: 'lax',
      path: SESSION_COOKIE_PATH,
    });
  }

  private toResponse(session: AuthSession): AuthResponseDto {
    return plainToInstance(
      AuthResponseDto,
      {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      { excludeExtraneousValues: true },
    );
  }
}
