import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

const GLOBAL_PREFIX = 'api';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(AppConfigService);

  app.setGlobalPrefix(GLOBAL_PREFIX);
  // Honor X-Forwarded-For so public-endpoint rate limiting keys on the real client IP,
  // not the proxy. (Behind the dev Next proxy, widget traffic otherwise shares one bucket.)
  app.set('trust proxy', 1);
  app.use(cookieParser());
  // credentials:true lets the browser send/receive the httpOnly auth cookie cross-origin.
  app.enableCors({ origin: config.corsOrigin, credentials: true });

  await app.listen(config.port);
}

void bootstrap();
