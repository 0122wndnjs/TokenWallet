// server/src/user/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  // 기타 필요한 필드 추가 가능
}