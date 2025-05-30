// TokenWallet/server/src/wallet/wallet.module.ts
import { Module, forwardRef } from '@nestjs/common'; // ✨ forwardRef 임포트 확인
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module'; // AuthModule 임포트

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule), // UserModule 임포트에 forwardRef 적용 (이전에 했음)
    forwardRef(() => AuthModule), // ✨ AuthModule 임포트에 forwardRef 적용
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}