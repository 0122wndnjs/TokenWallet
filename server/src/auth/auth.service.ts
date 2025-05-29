// server/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // UserService 임포트
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto'; // RegisterDto 임포트
import { LoginDto } from './dto/login.dto'; // LoginDto 임포트
import { User } from '../user/entities/user.entity'; // User 엔티티 임포트

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; user: Omit<User, 'password' | 'encryptedPrivateKey'> }> { // encryptedPrivateKey도 제외
    const { username, name, password, phoneNumber, email } = registerDto;

    // 중복 사용자 확인
    const existingUser = await this.userService.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 사용자 이름입니다.');
    }

    const existingEmail = await this.userService.findOneByEmail(email);
    if (existingEmail) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const existingPhoneNumber = await this.userService.findOneByPhoneNumber(phoneNumber);
    if (existingPhoneNumber) {
      throw new ConflictException('이미 가입된 전화번호입니다.');
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // 💡 지갑 생성 로직 포함하여 사용자 생성
      const user = await this.userService.createUser(username, name, hashedPassword, phoneNumber, email, password); // 💡 raw password 전달

      // JWT 토큰 생성
      const payload = { username: user.username, sub: user.id };
      const accessToken = this.jwtService.sign(payload);

      // 반환할 사용자 정보에서 비밀번호와 암호화된 개인 키 제외
      const { password: userPassword, encryptedPrivateKey, ...result } = user;
      return { accessToken, user: result };
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException('회원가입 중 오류가 발생했습니다.');
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'password' | 'encryptedPrivateKey'> }> { // encryptedPrivateKey도 제외
    const { username, password } = loginDto;
    const user = await this.userService.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    // 반환할 사용자 정보에서 비밀번호와 암호화된 개인 키 제외
    const { password: userPassword, encryptedPrivateKey, ...result } = user;
    return { accessToken, user: result };
  }
}