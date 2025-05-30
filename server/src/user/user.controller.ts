// TokenWallet/server/src/user/user.controller.ts
import { Controller, Get, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { User as UserEntity } from './entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { PriceService } from '../price/price.service'; // ✨ PriceService 임포트

@Controller('users') // '/api/user' 경로를 처리합니다.
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly priceService: PriceService, // ✨ PriceService를 주입받도록 수정
  ) {}

  @UseGuards(JwtAuthGuard) // JWT 인증 가드를 사용하여 이 엔드포인트를 보호합니다.
  @Get('me') // GET /api/user/profile 요청을 처리합니다.
  @HttpCode(HttpStatus.OK) // HTTP 상태 코드를 200 OK로 명시적으로 설정
  async getProfile(@Request() req: any) {
    const user: UserEntity = req.user; // req.user에서 인증된 사용자 정보(JWT 페이로드)를 가져옵니다.

    // 데이터베이스에서 비밀번호를 제외한 사용자 정보를 조회합니다.
    const userWithoutPassword = await this.userService.findOneWithoutPassword(user.id);

    if (!userWithoutPassword) {
      // 이 경우는 JwtAuthGuard에서 이미 처리했어야 하지만, 혹시 모를 경우를 대비합니다.
      // NestJS에서 표준 예외를 사용하는 것이 더 좋습니다.
      // throw new NotFoundException('User not found');
      throw new Error('User not found'); // 또는 NestJS의 NotFoundException 사용
    }

    // ✨ walletService.getBalances()를 호출하고 반환된 객체에서 값을 구조 분해 할당합니다.
    const { customTokenBalance, ethBalance } = await this.walletService.getBalances(user.walletAddress);

    // ✨ ETH의 현재 USD 가격을 가져옵니다.
    const ethPriceUsd = await this.priceService.fetchEthPriceInUsd(); // ✨ 이제 this.priceService 사용 가능

    // 사용자 정보와 지갑 잔액 정보를 함께 반환합니다.
    return {
      ...userWithoutPassword, // 비밀번호를 제외한 사용자 기본 정보
      customTokenBalance,     // 커스텀 토큰 잔액
      ethBalance,             // ETH 잔액
      ethPriceUsd,            // 현재 ETH 가격 (USD)
    };
  }
}