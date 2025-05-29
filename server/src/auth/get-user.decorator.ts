// server/src/auth/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user/entities/user.entity'; // 👈 User 엔티티 임포트

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // JwtStrategy에서 req.user에 할당된 사용자 객체를 반환
  },
);