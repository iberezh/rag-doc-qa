import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { AppConfigService } from '../config/app-config.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from './auth.constants';
import { AuthService } from './auth.service';
import { CurrentAccount } from './current-account.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { AuthContext, AuthResult, PublicProfile, UserWithAccount } from './auth.types';
import { SignupSchema, type SignupInput } from './schemas/signup.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(SignupSchema)) body: SignupInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicProfile> {
    return this.setCookie(res, await this.auth.signup(body));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: Request & { user: UserWithAccount },
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicProfile> {
    return this.setCookie(res, await this.auth.toAuthResult(req.user));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.clearCookie(AUTH_COOKIE, this.cookieOptions());
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentAccount() ctx: AuthContext): Promise<PublicProfile> {
    return this.auth.profile(ctx.userId);
  }

  private setCookie(res: Response, result: AuthResult): PublicProfile {
    res.cookie(AUTH_COOKIE, result.token, { ...this.cookieOptions(), maxAge: AUTH_COOKIE_MAX_AGE });
    return { user: result.user, account: result.account };
  }

  private cookieOptions(): CookieOptions {
    return { httpOnly: true, sameSite: 'lax', secure: this.config.isProduction, path: '/' };
  }
}
