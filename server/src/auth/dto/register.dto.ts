// server/src/auth/dto/register.dto.ts
import { IsString, IsNotEmpty, MinLength, IsEmail, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '사용자 이름을 입력해주세요.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '전화번호를 입력해주세요.' })
  // IsPhoneNumber 데코레이터는 'ko-KR'과 같은 특정 로케일을 필요로 할 수 있습니다.
  // 또는 직접 정규식을 사용할 수도 있습니다.
  @IsPhoneNumber('KR', { message: '올바른 전화번호 형식을 입력해주세요.' }) // 한국 전화번호 형식 검사
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;
}