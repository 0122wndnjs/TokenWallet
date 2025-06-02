// TokenWallet/server/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET 환경 변수가 정의되지 않았습니다. .env 파일을 확인해주세요.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<Omit<User, 'password'>> {
    const userId = payload.sub;

    if (!userId) {
      throw new UnauthorizedException('유효하지 않은 토큰 페이로드입니다. 사용자 ID(sub)가 없습니다.');
    }

    // ✨✨✨ 핵심 수정 부분: `findUserWithPrivateKey` 대신 `findUserWithRolesAndPrivateKey`와 같이 새로운 메서드를 만듭니다.
    // 이 메서드는 `encryptedPrivateKey`와 `role` 필드를 모두 포함하여 사용자를 조회합니다.
    const user = await this.userService.findUserWithRolesAndPrivateKey(userId); // 새로운 메서드 호출

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰이거나 사용자를 찾을 수 없습니다.');
    }

    const { password, ...result } = user;
    return result;
  }
}