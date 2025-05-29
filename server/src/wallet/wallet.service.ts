// server/src/wallet/wallet.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet, ethers } from 'ethers'; // ethers 라이브러리 임포트
import * as crypto from 'crypto'; // 개인 키 암호화를 위한 crypto 모듈 임포트

@Injectable()
export class WalletService {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly customTokenContractAddress: string;
  private readonly walletEncryptionSecret: string; // 암호화 키를 멤버 변수로 추가
  private readonly logger = new Logger(WalletService.name);

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL');
    const tokenContractAddress = this.configService.get<string>('CUSTOM_TOKEN_CONTRACT_ADDRESS');
    const encryptionSecret = this.configService.get<string>('WALLET_ENCRYPTION_SECRET');

    // 환경 변수 누락 체크
    if (!rpcUrl) {
      this.logger.error('ETHEREUM_RPC_URL is not defined in environment variables.');
      throw new InternalServerErrorException('Server configuration error: Missing ETHEREUM_RPC_URL.');
    }
    if (!tokenContractAddress) {
      this.logger.error('CUSTOM_TOKEN_CONTRACT_ADDRESS is not defined in environment variables.');
      throw new InternalServerErrorException('Server configuration error: Missing CUSTOM_TOKEN_CONTRACT_ADDRESS.');
    }
    if (!encryptionSecret) {
      this.logger.error('WALLET_ENCRYPTION_SECRET is not defined in environment variables.');
      // 보안 상 매우 중요하므로, 누락 시 앱 시작을 막음
      throw new InternalServerErrorException('Server configuration error: Missing WALLET_ENCRYPTION_SECRET.');
    }
    if (encryptionSecret.length < 32) { // AES-256-CBC는 32바이트(256비트) 키 필요
      this.logger.error('WALLET_ENCRYPTION_SECRET must be at least 32 characters long.');
      throw new InternalServerErrorException('Server configuration error: WALLET_ENCRYPTION_SECRET is too short.');
    }

    // 검증이 완료된 값들을 클래스 멤버 변수에 할당
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.customTokenContractAddress = tokenContractAddress;
    this.walletEncryptionSecret = encryptionSecret;

    this.logger.log(`WalletService initialized with RPC: ${rpcUrl} and Token: ${this.customTokenContractAddress}`);
  }

  /**
   * 새로운 이더리움 지갑 주소와 암호화된 개인 키를 생성합니다.
   * 개인 키는 WALLET_ENCRYPTION_SECRET을 사용하여 암호화됩니다.
   * @returns {address: string, encryptedPrivateKey: string}
   */
  async createNewWallet(): Promise<{ address: string; encryptedPrivateKey: string }> {
    const wallet = ethers.Wallet.createRandom(); // 새로운 지갑 생성
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    // 개인 키 암호화 (AES-256-CBC)
    // ⚠️ 경고: 이 방식은 WALLET_ENCRYPTION_SECRET이 노출되면 모든 개인 키가 위험합니다.
    // 실제 프로덕션에서는 각 사용자별로 고유한 암호화 키를 사용하고,
    // 이 키마저도 안전하게 관리(예: AWS KMS, Azure Key Vault 등)하거나,
    // 사용자의 비밀번호로부터 파생된 키를 사용하여 개인 키를 암호화해야 합니다.
    const iv = crypto.randomBytes(16); // Initialization Vector (16 bytes for AES-256-CBC)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.walletEncryptionSecret.slice(0, 32), 'utf8'), iv); // 32바이트 키 사용
    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedPrivateKey += cipher.final('hex');

    return {
      address: address,
      encryptedPrivateKey: iv.toString('hex') + ':' + encryptedPrivateKey, // IV를 개인 키와 함께 저장하여 복호화 시 사용
    };
  }

  /**
   * 암호화된 개인 키를 복호화하여 ethers.Wallet 인스턴스를 반환합니다.
   * @param encryptedPrivateKey 암호화된 개인 키 (IV 포함)
   * @returns ethers.Wallet 인스턴스
   */
  async decryptWallet(encryptedPrivateKey: string): Promise<ethers.Wallet> {
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 2) {
      throw new InternalServerErrorException('Invalid encrypted private key format.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.walletEncryptionSecret.slice(0, 32), 'utf8'), iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return new ethers.Wallet(decrypted, this.provider);
    } catch (error) {
      this.logger.error('Failed to decrypt private key:', error.message);
      throw new InternalServerErrorException('Failed to decrypt wallet private key.');
    }
  }

  /**
   * 특정 이더리움 주소의 커스텀 토큰 잔액을 조회합니다.
   * @param walletAddress 조회할 지갑 주소
   * @returns 토큰 잔액 (BigInt)
   */
  async getCustomTokenBalance(walletAddress: string): Promise<bigint> {
    // ERC-20 토큰의 최소 ABI (balanceOf 함수만 포함)
    // decimals, symbol, name은 선택 사항입니다.
    const tokenAbi = [
      "function balanceOf(address account) view returns (uint256)",
      // "function decimals() view returns (uint8)",
      // "function symbol() view returns (string)",
      // "function name() view returns (string)"
    ];
    
    // ERC-20 컨트랙트 인스턴스 생성
    const tokenContract = new ethers.Contract(this.customTokenContractAddress, tokenAbi, this.provider);

    try {
      const balance = await tokenContract.balanceOf(walletAddress);
      this.logger.log(`Balance of ${this.customTokenContractAddress} for ${walletAddress}: ${balance}`);
      return balance; // BigInt 반환
    } catch (error) {
      this.logger.error(`Error getting custom token balance for ${walletAddress}:`, error.message);
      throw new InternalServerErrorException('Failed to retrieve custom token balance.');
    }
  }

  /**
   * 특정 이더리움 주소의 네이티브 ETH 잔액을 조회합니다.
   * @param walletAddress 조회할 지갑 주소
   * @returns ETH 잔액 (BigInt)
   */
  async getEthBalance(walletAddress: string): Promise<bigint> {
    try {
      const balance = await this.provider.getBalance(walletAddress);
      this.logger.log(`ETH Balance for ${walletAddress}: ${balance}`);
      return balance; // BigInt 반환
    } catch (error) {
      this.logger.error(`Error getting ETH balance for ${walletAddress}:`, error.message);
      throw new InternalServerErrorException('Failed to retrieve ETH balance.');
    }
  }

  // 이더리움 개인 키 암호화를 위한 고정된 키 (개발용)
  // ⚠️ 중요: 이 함수는 더 이상 외부에서 호출되지 않으며, 암호화 키는 constructor에서 한 번만 설정됩니다.
  // 실제 프로덕션에서는 사용자별 고유한, 안전한 방식으로 키를 생성하고 관리해야 합니다.
  // 예를 들어, 사용자의 비밀번호 해시를 기반으로 하거나, KMS(Key Management Service)를 이용할 수 있습니다.
}