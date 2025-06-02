// server/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { WalletModule } from './wallet/wallet.module';
import { PriceModule } from './price/price.module';
import { AdminModule } from './admin/admin.module'; // ✨ AdminModule 임포트

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User],
        synchronize: true, // 개발 단계에서만 true. 프로덕션에서는 false 권장.
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    WalletModule,
    PriceModule,
    AdminModule, // ✨ AdminModule 추가
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}