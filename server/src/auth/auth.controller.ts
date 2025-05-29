// server/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // 성공 시 200 OK 반환
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'password' | 'encryptedPrivateKey'> }> {
    // 💡 loginDto 객체 전체를 인자로 전달
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED) // 성공 시 201 Created 반환
  async register(@Body() registerDto: RegisterDto): Promise<{ accessToken: string; user: Omit<User, 'password' | 'encryptedPrivateKey'> }> {
    // 💡 registerDto 객체 전체를 인자로 전달
    return this.authService.register(registerDto);
  }
}