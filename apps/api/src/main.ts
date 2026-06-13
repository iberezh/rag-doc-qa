import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

const GLOBAL_PREFIX = 'api';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.use(cookieParser());
  // credentials:true lets the browser send/receive the httpOnly auth cookie cross-origin.
  app.enableCors({ origin: config.corsOrigin, credentials: true });

  await app.listen(config.port);
}

void bootstrap();
