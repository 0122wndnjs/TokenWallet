// TokenWallet/server/src/user/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// ✨ UserRole Enum 추가 (선택 사항이지만 명확성을 위해 권장)
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column()
  password: string; // 해싱된 비밀번호

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true, nullable: true })
  walletAddress: string;

  @Column({ nullable: true, select: false })
  encryptedPrivateKey: string;

  // ✨ 추가: 사용자 역할 필드
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER }) // Enum 타입 사용
  role: UserRole;
}