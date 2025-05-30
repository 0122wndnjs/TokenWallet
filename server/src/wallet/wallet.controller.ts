// src/wallet/wallet.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  HttpStatus,
  BadRequestException, 
  InternalServerErrorException, 
  Logger
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { SendTokenDto } from './dto/send-token.dto'; 
import { User } from '../user/entities/user.entity'; 

// ✨ TransactionResponseDTO 인터페이스 추가 (이전 단계에서 이미 설명했던 내용)
// 이 인터페이스는 WalletService에서 반환하는 트랜잭션 객체의 형태와 일치해야 합니다.
export interface TransactionResponseDTO {
  hash: string;
  from: string;
  to: string;
  value: string; // 사람이 읽을 수 있는 형태로 변환된 값
  tokenName: string;
  tokenSymbol: string;
  tokenType: 'CUSTOM_TOKEN' | 'ETH'; // ETH 트랜잭션을 추가한다면 확장될 수 있음
  timestamp: number; // 밀리초 단위 Unix 타임스탬프
  blockNumber: string; // 블록 번호는 문자열로 처리
  status: 'success' | 'failed' | 'pending';
  direction: 'sent' | 'received' | 'unknown'; // 이 지갑 기준에서의 방향
}

// CustomRequest 인터페이스 (기존 코드와 동일)
interface CustomRequest extends Request {
  user: User; 
}

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name); // ✨ 컨트롤러에 자체 로거 인스턴스 추가

  constructor(private readonly walletService: WalletService) {}

  // 토큰 송금 엔드포인트 (기존 코드와 동일)
  @UseGuards(JwtAuthGuard) 
  @Post('send-token')
  async sendToken(@Request() req: CustomRequest, @Body() sendTokenDto: SendTokenDto) {
    const user: User = req.user; 
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
    } catch (error: any) { 
      console.error('토큰 전송 오류:', error.message);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
          throw error; 
      }
      throw new InternalServerErrorException('토큰 전송 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  // 기존 잔액 조회 엔드포인트 (기존 코드와 동일)
  @UseGuards(JwtAuthGuard)
  @Get('balances')
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

  /**
   * ✨✨✨ 수정 시작: 새로운 거래 내역 조회 엔드포인트 추가 ✨✨✨
   * 현재 로그인된 사용자의 지갑 주소에 대한 거래 내역을 반환합니다.
   */
  @UseGuards(JwtAuthGuard) // JWT 인증 가드 적용
  @Get('transactions')
  async getTransactions(@Request() req: CustomRequest): Promise<TransactionResponseDTO[]> {
    const user: User = req.user; // 현재 로그인된 사용자 정보 가져오기

    if (!user.walletAddress) {
      // 사용자의 지갑 주소가 없을 경우 예외 처리
      throw new BadRequestException('사용자의 지갑 주소를 찾을 수 없습니다.');
    }

    this.logger.log(`Fetching transactions for user ${user.username}'s wallet: ${user.walletAddress}`); 
    try {
      // WalletService의 getTransactions 함수 호출
      const transactions = await this.walletService.getTransactions(user.walletAddress);
      return transactions; // 조회된 트랜잭션 배열 반환
    } catch (error: any) {
      console.error('거래 내역 조회 중 오류 발생:', error.message);
      // WalletService에서 던진 예외를 그대로 다시 던지거나, 적절한 에러 메시지로 변환
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('거래 내역을 불러오는데 실패했습니다.');
    }
  }
  // ✨✨✨ 수정 끝 ✨✨✨
}