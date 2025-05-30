// TokenWallet/server/src/wallet/wallet.service.ts
import { Injectable, Logger, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto'; // 암호화를 위해 Node.js의 crypto 모듈 임포트

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private provider: ethers.JsonRpcProvider;
  private customTokenContract: ethers.Contract;
  private backendWallet: ethers.Wallet; // ✨ 이름 변경: 백엔드에서 토큰을 보낼 "운영" 지갑 인스턴스
  private encryptionSecret: string; // 사용자 지갑 개인키 암호화를 위한 비밀 키

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL');
    const customTokenAddress = this.configService.get<string>('CUSTOM_TOKEN_CONTRACT_ADDRESS');
    const backendPrivateKey = this.configService.get<string>('WALLET_PRIVATE_KEY'); 
    // const encryptionSecretFromEnv = this.configService.get<string>('WALLET_ENCRYPTION_KEY'); 
    const encryptionSecretFromEnv = "596dcdc67fe3bc0feaf8ba918fe5660da762396a3578d9ed8c1418a1620f1cb8"; // <-- 이 줄을 추가 (따옴표 안에 정확히)

    // 필수 환경 변수가 모두 존재하는지 확인
    if (!rpcUrl || !customTokenAddress || !backendPrivateKey || !encryptionSecretFromEnv) {
      this.logger.error('Missing required Ethereum/Wallet configuration in .env. Please check ETHEREUM_RPC_URL, CUSTOM_TOKEN_CONTRACT_ADDRESS, WALLET_PRIVATE_KEY, WALLET_ENCRYPTION_KEY.');
      throw new InternalServerErrorException('Ethereum/Wallet configuration missing');
    }

    this.encryptionSecret = encryptionSecretFromEnv; // ✨ 비-null 단언자 제거 (위에서 체크했으므로)

    this.logger.log(`WalletService initialized with RPC: ${rpcUrl} and Token: ${customTokenAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // ERC-20 토큰 ABI (transfer 함수만 있으면 충분)
    const customTokenAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
    ];

    this.customTokenContract = new ethers.Contract(customTokenAddress, customTokenAbi, this.provider);
    this.backendWallet = new ethers.Wallet(backendPrivateKey, this.provider); // ✨ 이름 변경 및 비-null 단언자 제거
  }

  // --- 개인키 암호화/복호화 헬퍼 메소드 ---

  /**
   * 개인키를 암호화합니다. IV를 무작위로 생성하고 암호화된 텍스트와 함께 반환합니다.
   * @param privateKey 암호화할 개인키 문자열 (예: '0x...')
   * @returns {string} 암호화된 개인키 (IV:암호화된데이터 형식)
   */
  public encryptPrivateKey(privateKey: string): string { // ✨ private -> public 변경
    if (!this.encryptionSecret || this.encryptionSecret.length !== 64) { // 256비트 키이므로 최소 32바이트(문자)
      throw new InternalServerErrorException('Wallet encryption secret is not configured or too short (min 32 chars).');
    }
    
    const iv = crypto.randomBytes(16); // ✨ 랜덤 IV 생성 (보안 강화)
    // ✨ utf8 인코딩으로 Buffer.from() 사용
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionSecret, 'hex'), iv); 
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted; // IV를 암호화된 데이터 앞에 붙여서 저장
  }

  /**
   * 암호화된 개인키를 복호화합니다.
   * @param encryptedText 암호화된 개인키 문자열 (IV:암호화된데이터 형식)
   * @returns {string} 복호화된 개인키
   */
  public decryptPrivateKey(encryptedText: string): string { // ✨ private -> public 변경
    if (!this.encryptionSecret || this.encryptionSecret.length !== 64) {
      throw new InternalServerErrorException('Wallet encryption secret is not configured or too short (min 32 chars).');
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid encrypted private key format. Expected IV:encrypted_data.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

   try {
      // ✨ 핵심 수정: 'utf8' 대신 'hex' 인코딩 사용
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionSecret, 'hex'), iv); 
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt private key:', error.message);
      throw new UnauthorizedException('Failed to decrypt wallet private key. It might be corrupted or an incorrect encryption key is used.');
    }
  }

  // --- 지갑 생성 및 잔액 조회 기존 로직 ---

  /**
   * 새로운 이더리움 지갑을 생성하고 개인키를 암호화하여 반환합니다.
   * 이 지갑은 회원가입 시 사용자에게 할당됩니다.
   * @returns { address: string; encryptedPrivateKey: string; } 새 지갑 주소와 암호화된 개인키
   */
  async createNewWallet(): Promise<{ address: string; encryptedPrivateKey: string }> {
    try {
      const wallet = ethers.Wallet.createRandom(); // 새로운 랜덤 지갑 생성
      // ✨ 수정: public encryptPrivateKey 메서드 사용
      const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey); 
      this.logger.log(`New wallet created for user: ${wallet.address}`);
      return {
        address: wallet.address,
        encryptedPrivateKey: encryptedPrivateKey,
      };
    } catch (error) {
      this.logger.error('Failed to create new wallet:', error.message);
      throw new InternalServerErrorException('Failed to create new wallet');
    }
  }

  /**
   * ETH 및 커스텀 토큰 잔액을 조회합니다.
   * @param address 조회할 지갑 주소
   * @returns { customTokenBalance: string, ethBalance: string } 잔액 정보
   */
  async getBalances(address: string): Promise<{ customTokenBalance: string; ethBalance: string }> {
    try {
      const ethBalance = await this.provider.getBalance(address);
      const customTokenBalance = await this.customTokenContract.getFunction('balanceOf')(address);
      // decimals는 한 번만 가져오면 되지만, 여기서는 간단화를 위해 매번 가져옵니다.
      // 실제로는 컨트랙트 생성 시 또는 서비스 시작 시 한 번만 가져와서 저장하는 것이 효율적입니다.
      // const decimals = await this.customTokenContract.getFunction('decimals')(); 

      return {
        ethBalance: ethBalance.toString(),
        customTokenBalance: customTokenBalance.toString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get balances for ${address}:`, error.message);
      throw new BadRequestException('Failed to fetch wallet balances');
    }
  }

  // --- 토큰 송금 기능 추가 ---

  /**
   * 사용자 지갑에서 커스텀 토큰을 전송합니다.
   * @param senderEncryptedPrivateKey 송신자의 암호화된 개인키
   * @param toAddress 수신자 지갑 주소
   * @param amount 전송할 토큰 수량 (사용자 입력 값, 단위를 신경 쓰지 않음)
   * @returns 트랜잭션 응답
   */
  async sendCustomToken( // ✨ 메서드 이름 변경 (sendToken -> sendCustomToken)
    senderEncryptedPrivateKey: string,
    toAddress: string,
    amount: string, // 사용자 입력값 (예: "100")
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      // 1. 암호화된 개인키를 복호화하여 실제 개인키 획득
      const decryptedPrivateKey = this.decryptPrivateKey(senderEncryptedPrivateKey);
      
      // 2. 복호화된 개인키로 사용자 지갑 인스턴스 생성
      const senderWallet = new ethers.Wallet(decryptedPrivateKey, this.provider);

      // 3. 토큰 컨트랙트의 decimals (소수점 자릿수) 가져오기
      // decimals는 한 번만 가져오면 되지만, 여기서는 간소화를 위해 매번 가져옵니다.
      const decimals = await this.customTokenContract.getFunction('decimals')();
      
      // 4. 전송할 토큰 수량을 컨트랙트가 이해할 수 있는 단위로 변환 (BigInt)
      const amountWei = ethers.parseUnits(amount, decimals);

      // 5. 트랜잭션 전송
      // 사용자의 지갑(senderWallet)을 통해 컨트랙트와 연결
      const tokenContractWithSigner = this.customTokenContract.connect(senderWallet);

      // ERC-20 transfer 함수 호출
      const tx = await tokenContractWithSigner.getFunction('transfer')(toAddress, amountWei);
      
      this.logger.log(`Token transfer transaction sent: ${tx.hash}`);
      
      // 트랜잭션이 블록에 포함될 때까지 대기
      await tx.wait(); 
      this.logger.log(`Token transfer transaction confirmed: ${tx.hash}`);

      return tx;
    } catch (error: any) { // ✨ any 타입 추가하여 error.code 접근 용이하게 함
      this.logger.error(`Failed to send custom token to ${toAddress} with amount ${amount}:`, error.message, error.stack);
      // ethers.js의 오류 코드를 기반으로 더 상세한 오류 메시지 제공
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new BadRequestException('Insufficient ETH for gas fees in sender wallet. Please ensure your wallet has enough ETH for transaction fees.');
      } else if (error.code === 'CALL_EXCEPTION' && error.reason && error.reason.includes('ERC20: transfer amount exceeds balance')) {
        // 컨트랙트에서 잔액 부족 오류를 명시적으로 반환할 경우
        throw new BadRequestException('Insufficient token balance in sender wallet.');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new BadRequestException('Could not estimate gas limit. Ensure receiver address is valid and sender has enough funds.');
      }
      throw new InternalServerErrorException(`Failed to send token: ${error.message || 'An unknown error occurred.'}`);
    }
  }
}