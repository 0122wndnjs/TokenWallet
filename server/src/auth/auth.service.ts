// server/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      message: '로그인 성공!',
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, name: user.name, email: user.email, phoneNumber: user.phoneNumber }, // 추가된 정보도 함께 반환
    };
  }

  async register(
    username: string,
    name: string, // 이름 추가
    password: string,
    phoneNumber: string, // 전화번호 추가
    email: string, // 이메일 추가
  ): Promise<any> {
    // 1. 아이디 중복 확인
    const existingUserByUsername = await this.userService.findOneByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    // 2. 이메일 중복 확인
    const existingUserByEmail = await this.userService.findOneByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 3. 전화번호 중복 확인
    const existingUserByPhoneNumber = await this.userService.findOneByPhoneNumber(phoneNumber);
    if (existingUserByPhoneNumber) {
      throw new ConflictException('이미 사용 중인 전화번호입니다.');
    }

    // 4. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. 새 사용자 생성 및 데이터베이스 저장 (새로운 필드들 전달)
    const newUser = await this.userService.createUser(
      username,
      name,
      hashedPassword,
      phoneNumber,
      email,
    );

    // 6. 회원가입 후 바로 로그인 토큰 발급
    const payload = { username: newUser.username, sub: newUser.id };
    return {
      message: '회원가입 성공!',
      accessToken: this.jwtService.sign(payload),
      user: { id: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email, phoneNumber: newUser.phoneNumber }, // 추가된 정보도 함께 반환
    };
  }
}