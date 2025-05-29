// server/src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private walletService: WalletService,
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

  // createUser 메서드 수정: 지갑 생성 로직 업데이트
  async createUser(
    username: string,
    name: string,
    hashedPassword: string,
    phoneNumber: string,
    email: string,
    // 💡 rawPasswordForEncryption 인자는 더 이상 직접적으로 사용되지 않지만,
    // 필요하다면 WalletService의 암호화 키 파생 로직에 활용될 수 있습니다.
    // 현재는 WalletService가 자체 WALLET_ENCRYPTION_SECRET을 사용합니다.
    rawPasswordForEncryption: string
  ): Promise<User> {
    // 💡 새로운 지갑 생성 (인자 없이 호출)
    const { address, encryptedPrivateKey } = await this.walletService.createNewWallet();

    const newUser = this.usersRepository.create({
      username,
      name,
      password: hashedPassword,
      phoneNumber,
      email,
      walletAddress: address,
      encryptedPrivateKey: encryptedPrivateKey,
    });
    return this.usersRepository.save(newUser);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneWithoutPassword(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'walletAddress', 'createdAt', 'updatedAt'],
    });
    return user;
  }
}