// server/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { WalletModule } from '../wallet/wallet.module'; // 💡 WalletModule 임포트

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // User 엔티티를 이 모듈에서 사용하도록 등록
    WalletModule, // 💡 WalletModule을 imports에 추가
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // AuthService에서 UserService를 사용하므로 export 해야 합니다.
})
export class UserModule {}