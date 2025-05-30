// TokenWallet/server/src/user/user.module.ts
import { Module, forwardRef } from '@nestjs/common'; // ✨ forwardRef 임포트
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PriceModule } from 'src/price/price.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => WalletModule), // ✨ WalletModule 임포트에 forwardRef 적용
    PriceModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}