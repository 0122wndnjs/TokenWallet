// server/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity'; // User 엔티티 임포트

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // JWT_SECRET 환경 변수가 반드시 설정되어 있다고 가정하고 '!'를 사용합니다.
    // 또는 configService.get<string>('JWT_SECRET', 'your_fallback_secret_key') 처럼 기본값을 줄 수도 있습니다.
    const secret = configService.get<string>('JWT_SECRET'); 
    
    // 💡 JWT_SECRET이 정의되지 않았을 경우 에러를 발생시켜 앱 시작을 방지합니다.
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // 💡 undefined가 아닌 확정된 string 타입 전달
    });
  }

  async validate(payload: any): Promise<Omit<User, 'password'>> { // 반환 타입 명확히 지정
    const userId = payload.sub;

    if (!userId) {
      throw new UnauthorizedException('유효하지 않은 토큰 페이로드입니다. 사용자 ID가 없습니다.');
    }

    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰이거나 사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 필드를 제외하고 반환합니다.
    const { password, ...result } = user;
    return result;
  }
}