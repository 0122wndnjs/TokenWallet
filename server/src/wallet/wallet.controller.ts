// src/wallet/wallet.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  HttpStatus,
  BadRequestException, // ✨ 추가: BadRequestException 임포트
  InternalServerErrorException // ✨ 추가: WalletService에서 throw할 수 있는 예외도 임포트해두는 것이 좋습니다.
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { SendTokenDto } from './dto/send-token.dto'; 
import { User } from '../user/entities/user.entity'; // User 엔티티 임포트

// ✨ 추가: req 객체의 타입을 정의하는 인터페이스
// NestJS의 기본 Request 타입에 user 속성을 추가합니다.
interface CustomRequest extends Request {
  user: User; // JwtAuthGuard가 req.user에 User 엔티티를 주입한다고 가정합니다.
}

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard) // JWT 인증 가드 적용
  @Post('send-token')
  // ✨ req 파라미터에 CustomRequest 타입을 명시합니다.
  async sendToken(@Request() req: CustomRequest, @Body() sendTokenDto: SendTokenDto) {
    const user: User = req.user; // 이제 req.user는 User 타입으로 인식됩니다.
    const { toAddress, amount } = sendTokenDto;

    if (!user.encryptedPrivateKey) {
      throw new BadRequestException('사용자의 개인 키가 없습니다. 지갑 생성 또는 로그인에 문제가 있을 수 있습니다.');
    }

    try {
      const transactionResponse = await this.walletService.sendCustomToken(
        user.encryptedPrivateKey, 
        toAddress,
        amount
      );
      return {
        statusCode: HttpStatus.OK,
        message: '토큰 전송 성공',
        transactionHash: transactionResponse.hash,
      };
    } catch (error: any) { // error 타입 명시 (에러 객체의 속성에 접근하기 위함)
      console.error('토큰 전송 오류:', error.message);
      // WalletService에서 이미 NestJS 예외를 throw했을 경우, 그대로 다시 던집니다.
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
         throw error; 
      }
      // 그 외 알 수 없는 오류는 InternalServerErrorException으로 처리합니다.
      throw new InternalServerErrorException('토큰 전송 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  // ✨ 기존 잔액 조회 엔드포인트
  @UseGuards(JwtAuthGuard)
  @Get('balances')
  // ✨ req 파라미터에 CustomRequest 타입을 명시합니다.
  async getBalances(@Request() req: CustomRequest) {
    const user: User = req.user;
    if (!user.walletAddress) {
      throw new BadRequestException('사용자의 지갑 주소가 없습니다.');
    }
    const balances = await this.walletService.getBalances(user.walletAddress);
    return {
      statusCode: HttpStatus.OK,
      message: '잔액 조회 성공',
      data: balances,
    };
  }
}