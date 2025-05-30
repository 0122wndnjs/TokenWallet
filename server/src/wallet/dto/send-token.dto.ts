// TokenWallet/server/src/wallet/dto/send-token.dto.ts
import { IsString, IsNotEmpty, IsEthereumAddress, IsNumberString, IsPositive } from 'class-validator';

export class SendTokenDto {
  @IsEthereumAddress({ message: '유효한 이더리움 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '수신자 주소는 필수입니다.' })
  toAddress: string;

  @IsNumberString({}, { message: '유효한 토큰 수량을 숫자로 입력해주세요.' })
  @IsNotEmpty({ message: '전송할 토큰 수량은 필수입니다.' })
  // IsPositive는 문자열에 바로 적용하기 어렵지만, 유효성 검사 파이프에서 숫자로 변환 후 추가 검사 가능
  // 여기서는 단순히 문자열 형식만 검사합니다.
  amount: string;
}