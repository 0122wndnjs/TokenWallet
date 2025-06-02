// TokenWallet/server/src/user/user.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm'; // ✨ Like, ILike 임포트 추가
import { User, UserRole } from './entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { PriceService } from '../price/price.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
        password: hashedPassword, // 'passwordHash' 대신 'password' 사용
        phoneNumber,
        email,
        walletAddress: walletAddress,
        encryptedPrivateKey: encryptedPrivateKey,
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      this.logger.error('Failed to create user:', error.message, error.stack);
      throw new InternalServerErrorException('사용자 생성에 실패했습니다.');
    }
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // 비밀번호와 개인 키를 제외한, role을 포함한 사용자 정보 조회 (클라이언트 전송용)
  async findOneWithoutSensitiveInfo(
    id: string,
  ): Promise<Omit<User, 'password' | 'encryptedPrivateKey'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'name',
        'email',
        'phoneNumber',
        'walletAddress',
        'createdAt',
        'updatedAt',
        'role',
      ],
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
      select: ['id', 'username', 'walletAddress', 'encryptedPrivateKey', 'role'],
    });
  }

  async findOneWithoutPassword(
    id: string,
  ): Promise<Omit<User, 'password' | 'encryptedPrivateKey'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'name',
        'email',
        'phoneNumber',
        'walletAddress',
        'createdAt',
        'updatedAt',
      ],
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

  /**
   * 사용자의 기본 정보와 함께 지갑 잔액, ETH-USD 가격을 조회하여 반환합니다.
   * @param userId 조회할 사용자 ID
   * @returns 사용자 정보, ETH 잔액, 커스텀 토큰 잔액, ETH-USD 가격을 포함하는 객체
   */
  async getUserInfoWithWallet(
    userId: string,
  ): Promise<
    User & { customTokenBalance: string; ethBalance: string; ethPriceUsd: number }
  > {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let customTokenBalance = '0';
    let ethBalance = '0';
    let ethPriceUsd = this.priceService.getEthPriceUsd() || 0;

    if (user.walletAddress) {
      try {
        const balances = await this.walletService.getBalances(user.walletAddress);
        customTokenBalance = balances.customTokenBalance;
        ethBalance = balances.ethBalance;

        ethPriceUsd = this.priceService.getEthPriceUsd() || 0;
      } catch (error) {
        this.logger.error(
          `Error fetching wallet balances for user ${userId}: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        `User ${user.username} (ID: ${userId}) does not have a wallet address.`,
      );
    }

    return {
      ...user,
      customTokenBalance,
      ethBalance,
      ethPriceUsd,
    };
  }

  // ✨ 추가: 사용자 역할 변경 메서드 (어드민 페이지에서 사용)
  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    user.role = newRole;
    return this.usersRepository.save(user);
  }

  // ✨ 기존 findAllUsers 대신, 페이지네이션 및 검색/필터링 기능을 가진 메서드로 대체
  /**
   * 어드민용: 페이지네이션 및 검색/필터링 기능을 가진 사용자 목록 조회.
   * @param page 현재 페이지 번호 (1부터 시작)
   * @param limit 한 페이지당 항목 수
   * @param searchQuery 검색어
   * @param searchField 검색할 필드 (예: 'username', 'email')
   * @returns 사용자 배열과 총 항목 수를 포함하는 객체
   */
  async findAllPaginatedAndFiltered(
    page: number,
    limit: number,
    searchQuery: string,
    searchField: string,
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit; // 건너뛸 항목 수 계산

    let whereCondition: any = {};
    if (searchQuery && searchField && searchField !== 'createdAt') {
      // PostgreSQL에서 대소문자 구분 없는 부분 일치 검색을 위해 ILike 사용
      // `searchField`는 User 엔티티의 컬럼 이름과 일치해야 합니다.
      whereCondition[searchField] = ILike(`%${searchQuery}%`);
    }

    try {
      // findAndCount 메서드를 사용하여 조건에 맞는 항목과 총 개수를 동시에 가져옵니다.
      const [users, total] = await this.usersRepository.findAndCount({
        where: whereCondition,
        take: limit, // 현재 페이지에서 가져올 항목 수
        skip: skip, // 이전 페이지에서 건너뛸 항목 수
        order: {
          createdAt: 'DESC', // 최신 사용자부터 정렬
        },
        select: [ // 클라이언트에게 보낼 필드만 선택
          'id',
          'username',
          'name',
          'email',
          'phoneNumber',
          'walletAddress',
          'role',
          'createdAt',
          'updatedAt',
        ],
      });
      return { users, total };
    } catch (error) {
      this.logger.error(
        `Failed to fetch paginated and filtered users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('사용자 목록 조회에 실패했습니다.');
    }
  }
}