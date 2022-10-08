import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN_URL || 'http://localhost:3000',
      credentials: true,
    },
  });
  app.use(cookieParser());
  await app.listen(3001);
}
bootstrap();
