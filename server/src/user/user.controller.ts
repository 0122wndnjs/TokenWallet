// server/src/user/user.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // 👈 AuthGuard 임포트
import { UserService } from './user.service'; // 👈 UserService 임포트
import { GetUser } from '../auth/get-user.decorator'; // 👈 GetUser 데코레이터 임포트
import { User } from './entities/user.entity'; // 👈 User 엔티티 임포트

@Controller('users') // 👈 기본 경로를 'users'로 설정
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt')) // 👈 JWT 인증 가드를 사용하여 이 엔드포인트를 보호
  @Get('me') // 👈 GET /users/me 엔드포인트
  async getLoggedInUser(@GetUser() user: User): Promise<Omit<User, 'password'>> {
    // @GetUser() 데코레이터를 통해 JwtStrategy에서 검증된 사용자 객체를 가져옵니다.
    // 비밀번호 필드를 제외한 사용자 정보를 반환합니다.
    const userWithoutPassword = await this.userService.findOneWithoutPassword(user.id);
    if (!userWithoutPassword) {
      // 이론적으로는 발생하지 않아야 하지만, 만약을 위한 방어 코드
      throw new Error('인증된 사용자를 찾을 수 없습니다.');
    }
    return userWithoutPassword;
  }
}