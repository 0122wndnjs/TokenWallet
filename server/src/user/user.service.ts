// TokenWallet/server/src/user/user.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common'; // InternalServerErrorException 임포트
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// import { WalletService } from '../wallet/wallet.service'; // ✨ WalletService는 여기서 직접 필요 없습니다.

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // private walletService: WalletService, // ✨ WalletService는 AuthService에서 지갑을 생성하므로 여기서는 필요 없습니다.
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
  async createUser( // ✨ 인자 시그니처 변경
    username: string,
    name: string,
    hashedPassword: string,
    phoneNumber: string,
    email: string,
    walletAddress: string,       // ✨ 추가된 인자
    encryptedPrivateKey: string, // ✨ 추가된 인자
  ): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        username,
        name,
        password: hashedPassword,
        phoneNumber,
        email,
        walletAddress: walletAddress,         // ✨ 전달받은 지갑 주소 사용
        encryptedPrivateKey: encryptedPrivateKey, // ✨ 전달받은 암호화된 개인키 사용
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new InternalServerErrorException('사용자 생성에 실패했습니다.');
    }
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneWithoutPassword(id: string): Promise<Omit<User, 'password' | 'encryptedPrivateKey'> | null> { // ✨ encryptedPrivateKey도 제외
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress', 'createdAt', 'updatedAt'],
      // `encryptedPrivateKey`는 기본적으로 `select: false`이므로 명시적으로 제외할 필요는 없지만,
      // `Omit` 타입에서 제거하여 더 명확하게 클라이언트로 전달되지 않음을 나타냅니다.
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
    // `select: ['encryptedPrivateKey']`를 명시적으로 추가하여 해당 필드를 로드합니다.
    return this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'walletAddress', 'encryptedPrivateKey'], // 필요한 필드만 선택
    });
  }
}