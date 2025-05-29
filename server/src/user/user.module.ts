// server/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 이 모듈에서 User 엔티티를 사용할 수 있도록 등록
  ],
  providers: [UserService],
  exports: [UserService], // 다른 모듈(AuthModule)에서 UserService를 주입받을 수 있도록 export
})
export class UserModule {}