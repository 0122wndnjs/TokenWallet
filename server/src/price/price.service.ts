// TokenWallet/server/src/price/price.service.ts

import { Injectable, Logger, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class PriceService implements OnModuleInit {
  private readonly logger = new Logger(PriceService.name);
  private ethPriceUsd: number | null = null;
  private readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
  // ✨ 가격 업데이트 주기를 설정합니다 (밀리초). 0으로 설정하면 자동 업데이트를 비활성화합니다.
  private readonly PRICE_UPDATE_INTERVAL_MS: number; 

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // 환경 변수에서 업데이트 주기를 가져오거나 기본값 (예: 5분 = 300000ms) 설정
    // 여기서는 일단 0으로 설정하여 자동 업데이트를 비활성화하겠습니다.
    this.PRICE_UPDATE_INTERVAL_MS = parseInt(this.configService.get<string>('ETH_PRICE_UPDATE_INTERVAL_MS') || '0', 10);
  }

  async onModuleInit() {
    this.logger.log('PriceService initialized. Fetching initial ETH price...');
    await this.fetchAndCacheEthPrice(); // 서버 시작 시 초기 가격 한 번 가져오기

    // ✨ 자동 업데이트 로직 수정: INTERVAL이 0보다 클 때만 주기적으로 업데이트
    if (this.PRICE_UPDATE_INTERVAL_MS > 0) {
      setInterval(async () => {
        this.logger.log('Attempting to update ETH price...');
        await this.fetchAndCacheEthPrice();
      }, this.PRICE_UPDATE_INTERVAL_MS);
    } else {
      this.logger.log('ETH price auto-update is disabled. Price will be fetched on demand.');
    }
  }

  private async fetchAndCacheEthPrice(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.COINGECKO_API_URL, {
          params: {
            ids: 'ethereum',
            vs_currencies: 'usd',
          },
        }).pipe(
          catchError((error: AxiosError) => {
            // ✨ 에러 메시지를 좀 더 명확하게 변경
            this.logger.error(`Failed to fetch ETH price: ${error.message}. Status: ${error.response?.status}`);
            throw new InternalServerErrorException(`Failed to fetch ETH price: ${error.message}`);
          }),
        ),
      );
      if (response.data && response.data.ethereum && response.data.ethereum.usd) {
        this.ethPriceUsd = response.data.ethereum.usd;
        this.logger.log(`ETH price updated: ${this.ethPriceUsd} USD`);
      } else {
        this.logger.error('Invalid response from CoinGecko API for ETH price.');
        throw new InternalServerErrorException('Invalid response from CoinGecko API for ETH price.');
      }
    } catch (error) {
      // 이미 catchError에서 로깅 및 예외를 던지고 있으므로, 여기서는 추가 로깅 대신 단순히 다시 던집니다.
      // throw error; // 이 부분은 이제 필요 없습니다.
    }
  }

  getEthPriceUsd(): number | null {
    if (this.ethPriceUsd === null) {
      this.logger.warn('ETH price is not yet available. Attempting to fetch now.');
      // ✨ 가격이 null일 경우, 요청 시점에 한 번 더 가져오도록 시도 (선택 사항)
      // 이 경우, 호출하는 쪽에서 await 해야 함. 간단하게는 그냥 null 반환
      // this.fetchAndCacheEthPrice(); 
    }
    return this.ethPriceUsd;
  }
}