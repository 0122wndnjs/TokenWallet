// TokenWallet/server/src/user/dto/update-user.dto.ts

import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string; // 사용자의 실제 이름 (수정 가능)

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string; // 이메일 (수정 가능)

  @IsOptional()
  @IsString()
  @IsPhoneNumber('KR') // 한국 전화번호 형식
  phoneNumber?: string; // 전화번호 (수정 가능)
}