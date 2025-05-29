// server/src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  username: string; // 아이디

  @Column({ nullable: false })
  name: string; // 이름 추가

  @Column({ nullable: false })
  password: string;

  @Column({ unique: true, nullable: false })
  phoneNumber: string; // 전화번호 추가 (중복 방지를 위해 unique 설정 고려)

  @Column({ unique: true, nullable: false })
  email: string; // 이메일 추가 (중복 방지를 위해 unique 설정 고려)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}