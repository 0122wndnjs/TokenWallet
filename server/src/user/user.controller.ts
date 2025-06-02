// TokenWallet/server/src/user/user.controller.ts
import { Controller, Get, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { User as UserEntity } from './entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { PriceService } from '../price/price.service';

interface CustomRequest extends Request {
  user: UserEntity;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly priceService: PriceService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: CustomRequest) {
    const user: UserEntity = req.user; // req.user에는 이제 role 필드도 포함되어 있습니다.

    // ✨ findOneWithoutPassword 대신 findOneWithoutSensitiveInfo 사용
    const userWithoutSensitiveInfo = await this.userService.findOneWithoutSensitiveInfo(user.id);

    if (!userWithoutSensitiveInfo) {
      throw new Error('User not found');
    }

    const { customTokenBalance, ethBalance } = await this.walletService.getBalances(user.walletAddress);
    const ethPriceUsd = this.priceService.getEthPriceUsd() || 0; // 초기 ETH 가격, null이면 0

    return {
      ...userWithoutSensitiveInfo,
      customTokenBalance,
      ethBalance,
      ethPriceUsd,
    };
  }
}