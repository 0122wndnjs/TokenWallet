// server/src/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ConfigModule } from '@nestjs/config'; // ConfigModule 임포트

@Module({
  imports: [ConfigModule], // ConfigModule을 imports에 추가
  providers: [WalletService],
  exports: [WalletService], // WalletService를 exports에 추가
})
export class WalletModule {}