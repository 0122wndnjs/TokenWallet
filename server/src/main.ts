// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ValidationPipe 임포트

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // 전역으로 ValidationPipe 적용
  app.enableCors(); // CORS 설정 (프론트엔드와 통신을 위해 필요)

  await app.listen(3000); // NestJS 서버가 사용할 포트
}
bootstrap();