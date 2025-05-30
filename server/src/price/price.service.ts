// TokenWallet/server/src/price/price.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common'; // ✨ CACHE_MANAGER는 여기서 제거
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // ✨ 여기에서 CACHE_MANAGER 임포트!

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly ETH_PRICE_CACHE_KEY = 'eth_price_usd';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async fetchEthPriceInUsd(): Promise<number> {
    // 1. 캐시에서 가격 조회
    const cachedPrice = await this.cacheManager.get<number>(this.ETH_PRICE_CACHE_KEY);
    if (cachedPrice) {
      this.logger.debug('Serving ETH price from cache.');
      return cachedPrice;
    }

    // 2. 캐시에 없으면 CoinGecko에서 새로 가져옴
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
    this.logger.log('Fetching ETH price from CoinGecko...');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Error fetching ETH price from CoinGecko: ${error.message}`, error.stack);
            throw new Error(`Failed to fetch ETH price: ${error.message}`);
          }),
        ),
      );

      const ethPrice = data.ethereum.usd;
      if (typeof ethPrice !== 'number') {
        throw new Error('Invalid ETH price received from CoinGecko.'); // 이 부분에 'new'가 붙어 있었네요. 제거했습니다.
      }

      // 3. 가져온 가격을 캐시에 저장 (TTL은 PriceModule에서 설정한 값 사용)
      await this.cacheManager.set(this.ETH_PRICE_CACHE_KEY, ethPrice);
      this.logger.log(`ETH price fetched and cached: ${ethPrice} USD`);

      return ethPrice;
    } catch (error) {
      this.logger.error(`Failed to fetch or cache ETH price: ${error.message}`);
      throw error;
    }
  }
}