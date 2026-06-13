import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigService } from '../config/app-config.service';
import { JWT_EXPIRES_IN } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: JWT_EXPIRES_IN },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
