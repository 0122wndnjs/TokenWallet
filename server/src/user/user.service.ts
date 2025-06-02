// TokenWallet/server/src/user/user.service.ts
import { 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException, // ✨ NotFoundException 임포트 추가
  Logger // ✨ Logger 임포트 추가
} from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { WalletService } from '../wallet/wallet.service'; // ✨ WalletService 임포트 추가
import { PriceService } from '../price/price.service'; // ✨ PriceService 임포트 추가

@Injectable()
export class UserService {
  // ✨ Logger 인스턴스 추가
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // ✨ WalletService와 PriceService 의존성 주입
    private walletService: WalletService, 
    private priceService: PriceService, 
  ) {}

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  /**
   * 새로운 사용자를 생성하고 저장합니다.
   * @param username 사용자 이름
   * @param name 이름
   * @param hashedPassword 해싱된 비밀번호
   * @param phoneNumber 전화번호
   * @param email 이메일
   * @param walletAddress 생성된 지갑 주소
   * @param encryptedPrivateKey 암호화된 개인 키
   * @returns 생성된 사용자 엔티티
   */
  async createUser( 
    username: string,
    name: string,
    hashedPassword: string,
    phoneNumber: string,
    email: string,
    walletAddress: string, 
    encryptedPrivateKey: string, 
  ): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        username,
        name,
        password: hashedPassword,
        phoneNumber,
        email,
        walletAddress: walletAddress, 
        encryptedPrivateKey: encryptedPrivateKey, 
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      this.logger.error('Failed to create user:', error.message, error.stack); // ✨ 로깅 개선
      throw new InternalServerErrorException('사용자 생성에 실패했습니다.');
    }
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // ✨ 추가: 비밀번호와 개인 키를 제외한, role을 포함한 사용자 정보 조회 (클라이언트 전송용)
  async findOneWithoutSensitiveInfo(id: string): Promise<Omit<User, 'password' | 'encryptedPrivateKey'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress', 'createdAt', 'updatedAt', 'role'], // role 포함
    });
    return user;
  }

  /**
   * ID로 사용자를 조회하고, 암호화된 개인 키와 역할을 포함하여 반환합니다.
   * 이 메서드는 개인 키와 역할 정보가 필요한 내부 로직에서만 사용되어야 합니다.
   * @param userId 조회할 사용자 ID
   * @returns 암호화된 개인 키와 역할이 포함된 사용자 엔티티 또는 null
   */
  async findUserWithRolesAndPrivateKey(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'walletAddress', 'encryptedPrivateKey', 'role'], // ✨ role 필드 추가
    });
  }

  async findOneWithoutPassword(id: string): Promise<Omit<User, 'password' | 'encryptedPrivateKey'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress', 'createdAt', 'updatedAt'],
    });
    return user;
  }

  /**
   * ID로 사용자를 조회하고, 암호화된 개인 키를 포함하여 반환합니다.
   * 이 메서드는 개인 키가 필요한 내부 로직(예: 송금)에서만 사용되어야 합니다.
   * @param userId 조회할 사용자 ID
   * @returns 암호화된 개인 키가 포함된 사용자 엔티티 또는 null
   */
  async findUserWithPrivateKey(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'walletAddress', 'encryptedPrivateKey'], 
    });
  }

  // ✨✨✨ 수정 시작: getUserInfoWithWallet 메서드 추가 및 수정 ✨✨✨
  /**
   * 사용자의 기본 정보와 함께 지갑 잔액, ETH-USD 가격을 조회하여 반환합니다.
   * @param userId 조회할 사용자 ID
   * @returns 사용자 정보, ETH 잔액, 커스텀 토큰 잔액, ETH-USD 가격을 포함하는 객체
   */
  async getUserInfoWithWallet(userId: string): Promise<User & { customTokenBalance: string; ethBalance: string; ethPriceUsd: number }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let customTokenBalance = '0';
    let ethBalance = '0';
    let ethPriceUsd = this.priceService.getEthPriceUsd() || 0; // 초기 ETH 가격, null이면 0

    if (user.walletAddress) {
      try {
        // WalletService에서 지갑 잔액을 가져옵니다.
        const balances = await this.walletService.getBalances(user.walletAddress);
        customTokenBalance = balances.customTokenBalance;
        ethBalance = balances.ethBalance;
        
        // 최신 ETH 가격을 다시 한번 시도 (서비스에 캐싱되어 있다면 캐싱된 값을 반환)
        ethPriceUsd = this.priceService.getEthPriceUsd() || 0; 

      } catch (error) {
        this.logger.error(`Error fetching wallet balances for user ${userId}: ${error.message}`);
        // 지갑 잔액 조회 실패 시에도 사용자 정보는 반환하되, 잔액은 0으로 처리
        // ethPriceUsd는 이미 초기화된 값을 사용하거나 0을 사용합니다.
      }
    } else {
      this.logger.warn(`User ${user.username} (ID: ${userId}) does not have a wallet address.`);
    }

    return {
      ...user,
      customTokenBalance,
      ethBalance,
      ethPriceUsd,
    };
  }
  // ✨✨✨ 수정 끝 ✨✨✨

   // ✨ 추가: 사용자 역할 변경 메서드 (어드민 페이지에서 사용)
  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    user.role = newRole;
    return this.usersRepository.save(user);
  }

  // ✨ 추가: 모든 사용자 목록 조회 (어드민 페이지에서 사용)
  async findAllUsers(): Promise<Omit<User, 'password' | 'encryptedPrivateKey'>[]> {
    // 개인 키와 비밀번호는 제외하고 모든 사용자 조회
    const users = await this.usersRepository.find({ 
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress', 'createdAt', 'updatedAt', 'role'],
    });
    return users;
  }
}