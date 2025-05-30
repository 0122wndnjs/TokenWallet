// TokenWallet/server/src/price/price.module.ts
import { Module } from '@nestjs/common'; // CacheModule은 여기서 제거
import { HttpModule } from '@nestjs/axios';
import { PriceService } from './price.service';
import { CacheModule } from '@nestjs/cache-manager'; // ✨ 여기에서 CacheModule 임포트!
// import * as redisStore from 'cache-manager-redis-store'; // Redis를 사용하려면 필요. (현재는 메모리 캐시)

@Module({
  imports: [
    HttpModule,
    CacheModule.register({ // registerAsync도 있지만, 간단한 설정은 register로 충분합니다.
      ttl: 60, // 캐시 유지 시간 (초). 여기서는 5분 = 300초
      max: 100, // 최대 캐시 항목 수 (선택 사항)
      // store: redisStore, // Redis 캐시를 사용하려면 이 부분 주석 해제 및 Redis 설정 추가
      // host: 'localhost',
      // port: 6379,
    }),
  ],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}