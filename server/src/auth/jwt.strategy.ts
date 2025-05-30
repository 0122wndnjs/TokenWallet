// TokenWallet/server/src/auth/jwt.strategy.ts
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
    const secret = configService.get<string>('JWT_SECRET'); 
    
    // JWT_SECRET이 정의되지 않았을 경우 앱 시작을 방지하기 위한 명확한 에러 처리
    if (!secret) {
      throw new Error('JWT_SECRET 환경 변수가 정의되지 않았습니다. .env 파일을 확인해주세요.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // undefined가 아닌 확정된 string 타입 전달
    });
  }

  /**
   * JWT 토큰의 페이로드(payload)를 검증하고, 해당 페이로드에 해당하는 사용자 정보를 반환합니다.
   * 이 반환된 사용자 객체는 @Request() req.user에 주입됩니다.
   * @param payload JWT 페이로드 (예: { sub: userId, username: '...' })
   * @returns User 엔티티 (비밀번호는 제외하지만, encryptedPrivateKey는 포함)
   */
  async validate(payload: any): Promise<Omit<User, 'password'>> { 
    const userId = payload.sub; // 일반적으로 JWT 페이로드의 'sub' 필드는 사용자 ID를 의미합니다.

    if (!userId) {
      throw new UnauthorizedException('유효하지 않은 토큰 페이로드입니다. 사용자 ID(sub)가 없습니다.');
    }

    // ✨✨✨ 핵심 수정 부분: `userService.findOneById` 대신 `userService.findUserWithPrivateKey`를 호출합니다.
    // 이 메서드는 `encryptedPrivateKey` 필드를 포함하여 사용자를 조회합니다.
    const user = await this.userService.findUserWithPrivateKey(userId);

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰이거나 사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 필드는 클라이언트에 노출하지 않기 위해 제외합니다.
    // user 객체에는 이제 `encryptedPrivateKey`가 포함되어 있습니다.
    const { password, ...result } = user; 
    return result; // 이 result 객체가 컨트롤러의 `req.user`에 할당됩니다.
  }
}