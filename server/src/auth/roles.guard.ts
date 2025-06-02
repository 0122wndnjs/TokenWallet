// server/src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { User } from '../user/entities/user.entity'; // User 엔티티 임포트

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // 역할 제한이 없는 경우 (공개 API)
    }

    // `JwtStrategy`에서 req.user에 주입된 사용자 정보는 password가 제외된 User 엔티티입니다.
    // role 필드는 포함되어 있어야 합니다.
    const user = context.switchToHttp().getRequest().user as User;
    
    // 사용자의 역할이 필요한 역할 목록에 포함되어 있는지 확인
    return requiredRoles.some((role) => user.role === role);
  }
}