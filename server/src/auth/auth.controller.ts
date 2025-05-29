// server/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common'; // Get 데코레이터 필요 시 추가
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.name,
      registerDto.password,
      registerDto.phoneNumber,
      registerDto.email,
    );
  }

  @Post('logout') // POST /auth/logout 엔드포인트
  @HttpCode(HttpStatus.OK)
  async logout() {
    // JWT는 서버 측에서 직접 세션을 파괴할 것이 없으므로,
    // 클라이언트에게 토큰을 삭제하라는 메시지를 보내거나 단순히 성공 응답을 반환합니다.
    // 만약 토큰 블랙리스트를 구현한다면 여기에 로직을 추가합니다.
    return { message: '로그아웃 되었습니다. 클라이언트에서 토큰을 삭제해주세요.' };
  }
}