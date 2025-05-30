// TokenWallet/server/src/user/entities/user.entity.ts
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

  // ✨ 추가: 암호화된 개인 키 필드
  // @Column({ nullable: true, select: false }) // ⚠️ 중요: select: false 를 통해 API 응답에서 자동으로 제외되도록 합니다.
  @Column({ nullable: true, select: false }) 
  encryptedPrivateKey: string; //⚠️ 보안: 실제 개인 키는 DB에 평문으로 저장하면 절대 안 됩니다. 반드시 암호화해야 합니다!
}