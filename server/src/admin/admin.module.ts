// TokenWallet/server/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule], // UserModule에서 UserService를 export하고 있으므로 AdminController에서 사용 가능
  controllers: [AdminController],
  providers: [], // AdminService가 필요하다면 추가 (현재는 UserService만 사용)
})
export class AdminModule {}