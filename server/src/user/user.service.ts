// server/src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// import { CreateUserDto } from './dto/create-user.dto'; // 필요하다면 주석 해제

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async createUser(
    username: string,
    name: string,
    hashedPassword: string,
    phoneNumber: string,
    email: string,
  ): Promise<User> {
    const newUser = this.usersRepository.create({
      username,
      name,
      password: hashedPassword,
      phoneNumber,
      email,
    });
    return this.usersRepository.save(newUser);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * 비밀번호 필드를 제외한 사용자 정보를 반환합니다.
   * @param id 사용자 ID
   * @returns 비밀번호가 제외된 사용자 객체
   */
  async findOneWithoutPassword(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'name', 'email', 'phoneNumber', 'createdAt', 'updatedAt'], // 비밀번호 제외
    });
    return user;
  }
}