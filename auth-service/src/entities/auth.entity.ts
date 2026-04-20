
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auth') // DB에 'users'라는 테이블이 생깁니다.
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  loginId: string;

  @Column()
  password: string; 

  // @Column({ type: 'varchar', nullable: true })
  // refresh_token: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
