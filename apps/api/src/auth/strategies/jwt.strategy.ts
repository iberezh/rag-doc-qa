import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../config/app-config.service';
import { AUTH_COOKIE } from '../auth.constants';
import type { AuthContext, JwtPayload } from '../auth.types';

const fromCookie = (req: Request): string | null => {
  // cookie-parser augments the request; narrow defensively rather than trust its `any`.
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[AUTH_COOKIE];
  return typeof token === 'string' ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      secretOrKey: config.jwtSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): AuthContext {
    return { userId: payload.sub, accountId: payload.accountId };
  }
}
