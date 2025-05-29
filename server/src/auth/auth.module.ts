// server/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    PassportModule, // 👈 PassportModule 임포트 (이전에도 있었지만, 혹시 빠졌을까봐 재확인)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 👈 JwtStrategy를 providers에 추가
  exports: [AuthService, JwtModule, PassportModule], // 👈 PassportModule도 export
})
export class AuthModule {}