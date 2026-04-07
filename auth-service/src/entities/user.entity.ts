// src/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users') // DB에 'users'라는 테이블이 생깁니다.
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; 

  @Column()
  nickname: string;
}