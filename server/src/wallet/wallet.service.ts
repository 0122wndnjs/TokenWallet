// TokenWallet/server/src/wallet/wallet.service.ts

import { Injectable, Logger, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto'; 
import axios from 'axios'; 

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private provider: ethers.JsonRpcProvider;
  private customTokenContract: ethers.Contract;
  private backendWallet: ethers.Wallet; 
  private encryptionSecret: string; 
  private customTokenAddress: string;
  private etherscanApiKey: string;
  private etherscanApiUrlSepolia: string;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL_SEPOLIA');
    this.customTokenAddress = this.configService.get<string>('CUSTOM_TOKEN_CONTRACT_ADDRESS')!; 
    const backendPrivateKey = this.configService.get<string>('WALLET_PRIVATE_KEY'); 
    const encryptionSecretFromEnv = this.configService.get<string>('WALLET_ENCRYPTION_KEY')!; 
    this.etherscanApiKey = this.configService.get<string>('ETHERSCAN_API_KEY')!; 
    this.etherscanApiUrlSepolia = this.configService.get<string>('ETHERSCAN_API_URL_SEPOLIA')!; 

    if (!rpcUrl || !this.customTokenAddress || !backendPrivateKey || !encryptionSecretFromEnv || !this.etherscanApiKey || !this.etherscanApiUrlSepolia) {
      this.logger.error('WalletService: Missing required Ethereum/Wallet configuration in .env. Please check ETHEREUM_RPC_URL_SEPOLIA, CUSTOM_TOKEN_CONTRACT_ADDRESS, WALLET_PRIVATE_KEY, WALLET_ENCRYPTION_KEY, ETHERSCAN_API_KEY, ETHERSCAN_API_URL_SEPOLIA.');
      throw new InternalServerErrorException('Ethereum/Wallet configuration missing');
    }

    this.encryptionSecret = encryptionSecretFromEnv; 

    this.logger.log(`WalletService initialized. RPC: ${rpcUrl}, Token: ${this.customTokenAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const customTokenAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];

    this.customTokenContract = new ethers.Contract(this.customTokenAddress, customTokenAbi, this.provider);
    this.backendWallet = new ethers.Wallet(backendPrivateKey, this.provider); 
  }

  public encryptPrivateKey(privateKey: string): string {
    if (!this.encryptionSecret || this.encryptionSecret.length < 32) {
      this.logger.error('encryptPrivateKey: Wallet encryption secret is not configured or too short (min 32 bytes).');
      throw new InternalServerErrorException('Wallet encryption secret is not configured or too short.');
    }
    
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionSecret, 'hex'), iv); 
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted; 
  }

  public decryptPrivateKey(encryptedText: string): string {
    if (!this.encryptionSecret || this.encryptionSecret.length < 32) {
      this.logger.error('decryptPrivateKey: Wallet encryption secret is not configured or too short (min 32 bytes).');
      throw new InternalServerErrorException('Wallet encryption secret is not configured or too short.');
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      this.logger.error('decryptPrivateKey: Invalid encrypted private key format.');
      throw new BadRequestException('Invalid encrypted private key format. Expected IV:encrypted_data.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionSecret, 'hex'), iv); 
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error: any) {
      this.logger.error('decryptPrivateKey: Failed to decrypt private key:', error.message);
      throw new UnauthorizedException('Failed to decrypt wallet private key. It might be corrupted or an incorrect encryption key is used.');
    }
  }

  async createNewWallet(): Promise<{ address: string; encryptedPrivateKey: string }> {
    try {
      const wallet = ethers.Wallet.createRandom(); 
      const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey); 
      this.logger.log(`createNewWallet: New wallet created: ${wallet.address}`);
      return {
        address: wallet.address,
        encryptedPrivateKey: encryptedPrivateKey,
      };
    } catch (error: any) {
      this.logger.error('createNewWallet: Failed to create new wallet:', error.message);
      throw new InternalServerErrorException('Failed to create new wallet');
    }
  }

  async getBalances(address: string): Promise<{ customTokenBalance: string; ethBalance: string }> {
    if (!ethers.isAddress(address)) {
      this.logger.error(`getBalances: Invalid address provided: ${address}`);
      throw new BadRequestException('유효하지 않은 지갑 주소입니다.');
    }
    try {
      const ethBalance = await this.provider.getBalance(address);
      const customTokenBalance = await this.customTokenContract.getFunction('balanceOf')(address);
      
      this.logger.log(`getBalances: Fetched balances for ${address} - ETH: ${ethers.formatEther(ethBalance)}, Token: ${ethers.formatUnits(customTokenBalance, await this.customTokenContract.getFunction('decimals')())}`);
      return {
        ethBalance: ethers.formatEther(ethBalance),
        customTokenBalance: ethers.formatUnits(customTokenBalance, await this.customTokenContract.getFunction('decimals')()),
      };
    } catch (error: any) {
      this.logger.error(`getBalances: Failed to get balances for ${address}:`, error.message);
      throw new InternalServerErrorException('Failed to fetch wallet balances');
    }
  }

  async sendCustomToken( 
    senderEncryptedPrivateKey: string,
    toAddress: string,
    amount: string, 
  ): Promise<ethers.ContractTransactionResponse> {
    if (!ethers.isAddress(toAddress)) {
      this.logger.error(`sendCustomToken: Invalid recipient address provided: ${toAddress}`);
      throw new BadRequestException('유효하지 않은 수신자 지갑 주소입니다.');
    }
    if (parseFloat(amount) <= 0) {
      this.logger.error(`sendCustomToken: Invalid amount provided: ${amount}`);
      throw new BadRequestException('유효하지 않은 송금액입니다. 0보다 커야 합니다.');
    }

    try {
      const decryptedPrivateKey = this.decryptPrivateKey(senderEncryptedPrivateKey);
      const senderWallet = new ethers.Wallet(decryptedPrivateKey, this.provider);
      const decimals = await this.customTokenContract.getFunction('decimals')();
      const amountWei = ethers.parseUnits(amount, decimals); 
      const tokenContractWithSigner = this.customTokenContract.connect(senderWallet);
      
      this.logger.log(`sendCustomToken: Preparing to send ${amount} tokens from ${senderWallet.address} to ${toAddress}`);
      const tx = await tokenContractWithSigner.getFunction('transfer')(toAddress, amountWei);
      
      this.logger.log(`sendCustomToken: Transaction sent: ${tx.hash}`);
      
      await tx.wait(); 
      this.logger.log(`sendCustomToken: Transaction confirmed: ${tx.hash}`);

      return tx;
    } catch (error: any) { 
      this.logger.error(`sendCustomToken: Failed to send custom token to ${toAddress} with amount ${amount}:`, error.message, error.stack);
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new BadRequestException('Insufficient ETH for gas fees in sender wallet. Please ensure your wallet has enough ETH for transaction fees.');
      } else if (error.code === 'CALL_EXCEPTION' && error.reason && error.reason.includes('ERC20: transfer amount exceeds balance')) {
        throw new BadRequestException('Insufficient token balance in sender wallet.');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new BadRequestException('Could not estimate gas limit. Ensure receiver address is valid and sender has enough funds.');
      }
      throw new InternalServerErrorException(`Failed to send token: ${error.message || 'An unknown error occurred.'}`);
    }
  }

  /**
   * Etherscan API를 사용하여 특정 주소의 ERC-20 토큰 전송 내역을 조회합니다.
   *
   * @param walletAddress 조회할 지갑 주소
   * @returns 트랜잭션 객체 배열
   */
  async getTransactions(walletAddress: string): Promise<any[]> {
    this.logger.log(`[getTransactions] Attempting to fetch transactions for address: ${walletAddress}`);

    if (!ethers.isAddress(walletAddress)) {
      this.logger.error(`[getTransactions] Invalid wallet address provided: ${walletAddress}`);
      throw new BadRequestException('유효하지 않은 지갑 주소입니다.');
    }

    if (!this.etherscanApiKey || !this.etherscanApiUrlSepolia) {
        this.logger.error('[getTransactions] Etherscan API key or URL is not configured.');
        throw new InternalServerErrorException('Etherscan API configuration missing.');
    }

    try {
      this.logger.log(`[getTransactions] Querying Etherscan for token transactions for ${walletAddress} on contract ${this.customTokenAddress}`);
      const response = await axios.get(this.etherscanApiUrlSepolia, {
        params: {
          module: 'account',
          action: 'tokentx',
          address: walletAddress,
          contractaddress: this.customTokenAddress,
          sort: 'desc',
          apikey: this.etherscanApiKey,
        },
      });

      if (response.data.status === '1') {
        const transactions = response.data.result.map((tx: any) => {
          // ✨✨✨ 이 부분을 수정합니다: tx.tokenDecimal이 이미 숫자이거나 숫자로 변환 가능한 문자열일 경우,
          // formatUnits는 숫자를 기대하므로 parseInt를 사용하거나, 이미 숫자라면 그대로 사용합니다.
          // .toString()을 제거하여 숫자형 문자열을 다시 문자열로 만들지 않도록 합니다.
          let decimalValue = parseInt(tx.tokenDecimal); // Etherscan에서 문자열로 올 경우를 대비하여 parseInt 사용
          if (isNaN(decimalValue)) { // 혹시 파싱 실패 시 기본값 18 사용
              this.logger.warn(`[getTransactions] Invalid tokenDecimal for tx ${tx.hash}: ${tx.tokenDecimal}. Defaulting to 18.`);
              decimalValue = 18;
          }

          const value = ethers.formatUnits(tx.value, decimalValue); // ✨ 이제 decimalValue는 숫자입니다.
          
          let direction: string;
          if (tx.from && tx.from.toLowerCase() === walletAddress.toLowerCase()) {
            direction = 'sent';
          } else if (tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase()) {
            direction = 'received';
          } else {
            direction = 'unknown'; 
          }

          return {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: value, 
            tokenName: tx.tokenName, 
            tokenSymbol: tx.tokenSymbol, 
            tokenType: 'CUSTOM_TOKEN', 
            timestamp: parseInt(tx.timeStamp) * 1000, 
            blockNumber: tx.blockNumber,
            status: 'success', 
            direction: direction
          };
        });
        this.logger.log(`[getTransactions] Successfully fetched ${transactions.length} custom token transactions for ${walletAddress}.`);
        return transactions;
      } else {
        if (response.data.message && response.data.message.includes('No transactions found')) {
            this.logger.log(`[getTransactions] No transactions found for ${walletAddress} on Etherscan.`);
            return [];
        }
        this.logger.warn(`[getTransactions] Etherscan API returned status 0 for ${walletAddress}: ${response.data.message}.`);
        throw new InternalServerErrorException(`Failed to fetch transactions from Etherscan: ${response.data.message || 'Unknown Etherscan API error.'}`);
      }
    } catch (error: any) {
      this.logger.error(`[getTransactions] Error fetching transactions for ${walletAddress} from Etherscan:`, error.message, error.stack);
      const errorMessage = error.response?.data?.message || error.message;
      throw new InternalServerErrorException(`거래 내역을 불러오는데 실패했습니다: ${errorMessage}`);
    }
  }
}