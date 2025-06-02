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

  // walletAddress는 여기에 포함하지 않습니다.
  // 어드민이 이 필드를 수정하는 것을 원천적으로 방지합니다.
}