// TokenWallet/server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // ✨ 수정: CORS origin 명시. app.setGlobalPrefix('api'); 줄은 삭제하거나 주석 처리합니다.
  app.enableCors({
    origin: 'http://localhost:5173', // 프론트엔드 개발 서버 주소
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // app.setGlobalPrefix('api'); // 이 줄을 삭제하거나 주석 처리합니다.

  await app.listen(3000);
}
bootstrap();