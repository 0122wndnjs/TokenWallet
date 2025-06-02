// server/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module'; // UserService를 사용하기 위해 UserModule 임포트

@Module({
  imports: [UserModule], // UserService를 주입받기 위해 UserModule 임포트
  controllers: [AdminController],
  providers: [], // AdminService가 필요하다면 추가
})
export class AdminModule {}