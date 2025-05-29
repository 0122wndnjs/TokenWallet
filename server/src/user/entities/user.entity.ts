// server/src/user/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn() // 👈 생성일자 자동 기록
  createdAt: Date;

  @UpdateDateColumn() // 👈 업데이트 일자 자동 기록
  updatedAt: Date;

  // 💡 지갑 주소 필드 추가
  @Column({ unique: true, nullable: true })
  walletAddress: string;

  // 💡 암호화된 개인 키 필드 추가 (DB에는 암호화된 형태로만 저장해야 합니다!)
  @Column({ nullable: true })
  encryptedPrivateKey: string; //⚠️ 보안: 실제 프로덕션에서는 개인 키를 DB에 평문으로 저장하면 절대 안 됩니다. 암호화 필수!
}
