// TokenWallet/server/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
// import { UserService } from '../user/user.service'; // ✨ 이제 직접 임포트할 필요 없음
import { UserModule } from '../user/user.module'; // UserModule에서 UserService를 export하고 있으므로 여기에 providers로 추가할 필요 없음

@Module({
  imports: [UserModule], // UserModule에서 UserService를 export하고 있으므로 AdminController에서 사용 가능
  controllers: [AdminController],
  providers: [], // AdminService가 필요하다면 추가 (현재는 UserService만 사용)
})
export class AdminModule {}