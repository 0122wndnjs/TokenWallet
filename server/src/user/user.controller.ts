// server/src/user/user.controller.ts
import { Controller, Get, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './entities/user.entity';
import { WalletService } from '../wallet/wallet.service'; // 💡 WalletService 임포트

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService, // 💡 WalletService 주입
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getLoggedInUser(@GetUser() user: User): Promise<Omit<User, 'password' | 'encryptedPrivateKey'>> {
    // 반환할 사용자 정보에서 비밀번호와 암호화된 개인 키 제외
    const { password, encryptedPrivateKey, ...result } = user;
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/wallet') // 💡 새로운 엔드포인트: 로그인된 사용자의 지갑 정보와 잔액 반환
  async getMyWalletInfo(@GetUser() user: User): Promise<{
    walletAddress: string;
    customTokenBalance: string; // BigInt를 문자열로 반환
    ethBalance: string; // BigInt를 문자열로 반환
  }> {
    if (!user.walletAddress) {
      throw new InternalServerErrorException('사용자에게 연결된 지갑 주소가 없습니다.');
    }

    try {
      const customTokenBalance = await this.walletService.getCustomTokenBalance(user.walletAddress);
      const ethBalance = await this.walletService.getEthBalance(user.walletAddress);

      return {
        walletAddress: user.walletAddress,
        customTokenBalance: customTokenBalance.toString(), // BigInt를 문자열로 변환하여 전송
        ethBalance: ethBalance.toString(), // BigInt를 문자열로 변환하여 전송
      };
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      throw new InternalServerErrorException('지갑 정보를 가져오는 데 실패했습니다.');
    }
  }
}