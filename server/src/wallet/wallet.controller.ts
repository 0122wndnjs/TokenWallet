// TokenWallet/server/src/wallet/wallet.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request, HttpStatus, HttpCode, InternalServerErrorException } from '@nestjs/common'; // InternalServerErrorException 추가
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendTokenDto } from './dto/send-token.dto';
import { User as UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service'; // ✨ UserService 임포트

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly userService: UserService, // ✨ UserService 주입
  ) {}

  @Get('balances')
  async getBalances(@Request() req: any) {
    const user: UserEntity = req.user;
    if (!user || !user.walletAddress) {
      throw new Error('User or wallet address not found');
    }
    const { customTokenBalance, ethBalance } = await this.walletService.getBalances(user.walletAddress);
    return {
      walletAddress: user.walletAddress,
      customTokenBalance,
      ethBalance,
    };
  }

  @Post('send-token')
  @HttpCode(HttpStatus.OK)
  async sendToken(@Request() req: any, @Body() sendTokenDto: SendTokenDto) {
    const userId: string = req.user.id; // 인증된 사용자 ID 가져오기

    // 1. 사용자 ID를 사용하여 암호화된 개인 키를 포함한 사용자 정보 조회
    const userWithPrivateKey = await this.userService.findUserWithPrivateKey(userId);

    if (!userWithPrivateKey || !userWithPrivateKey.encryptedPrivateKey) {
      // 이 경우는 매우 드물게 발생해야 하지만, 방어적으로 처리합니다.
      throw new InternalServerErrorException('User private key not found or accessible.');
    }

    const { toAddress, amount } = sendTokenDto;

    try {
      // 2. WalletService의 sendCustomToken 메서드에 암호화된 개인 키 전달
      const transaction = await this.walletService.sendCustomToken(
        userWithPrivateKey.encryptedPrivateKey, // ✨ 암호화된 개인 키 전달
        toAddress,
        amount
      );
      
      return {
        message: 'Token sent successfully!',
        transactionHash: transaction.hash,
      };
    } catch (error) {
      // WalletService에서 던진 구체적인 예외를 여기서 다시 던집니다.
      // NestJS의 Exception Filter가 이를 처리하여 적절한 HTTP 응답을 생성할 것입니다.
      throw error; 
    }
  }
}