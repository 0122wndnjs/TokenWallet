// server/src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // 이메일 중복 확인을 위한 메서드 추가
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // 전화번호 중복 확인을 위한 메서드 추가
  async findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  // createUser 메서드에 새로운 필드들을 인수로 추가
  async createUser(
    username: string,
    name: string, // 이름 추가
    hashedPassword: string,
    phoneNumber: string, // 전화번호 추가
    email: string, // 이메일 추가
  ): Promise<User> {
    const newUser = this.usersRepository.create({
      username,
      name, // 이름
      password: hashedPassword,
      phoneNumber, // 전화번호
      email, // 이메일
    });
    return this.usersRepository.save(newUser);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}