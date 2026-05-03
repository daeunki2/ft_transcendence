// src/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users') // DB에 'users'라는 테이블이 생깁니다.
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  // DB 컬럼명은 기존(email)을 유지해 마이그레이션 없이 코드 의미만 loginId로 정리
  @Column({ name: 'email', unique: true })
  loginId: string;

  @Column()
  nickname: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  userPhoto: string;

  @Column()
  role: string;
}
