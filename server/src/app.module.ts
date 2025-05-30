// server/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm'; // TypeORM 임포트
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule 임포트
import { UserModule } from './user/user.module'; // UserModule 임포트
import { User } from './user/entities/user.entity'; // User 엔티티 임포트
import { WalletModule } from './wallet/wallet.module';
import { PriceModule } from './price/price.module';

@Module({
  imports: [
    // ConfigModule은 다른 모듈보다 먼저 로드되어야 환경 변수를 사용할 수 있습니다.
    ConfigModule.forRoot({
      isGlobal: true, // .env 파일을 전역에서 사용 가능하게 함
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // 사용하는 데이터베이스 타입 (예: 'postgres', 'mysql', 'sqlite')
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User], // 애플리케이션에서 사용할 모든 엔티티를 여기에 배열로 추가
        synchronize: true, // 개발 단계에서만 true로 설정 (스키마 자동 생성). 프로덕션에서는 false 권장.
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    WalletModule,
    PriceModule, // UserModule 임포트
    // WalletModule 등 다른 모듈들도 여기에 추가
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}