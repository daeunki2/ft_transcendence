// src/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users') // DB에 'users'라는 테이블이 생깁니다.
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  // 이유: make 오류나서 보니 아마도 이메일 아이디 충돌인거 같아 일단 주석처리
  // // 게스트는 email 이 NULL. PG 의 unique+nullable 은 NULL 다중 허용.
  // @Column({ unique: true, nullable: true, type: 'varchar' })
  // email: string | null;

  // 이유: 서비스/컨트롤러 전반이 loginId 명칭을 사용하므로 엔티티도 loginId로 통일한다.
  // 이유: DB 마이그레이션 없이 즉시 동작시키기 위해 기존 users.email 컬럼명에 매핑 추후에 수정 필요할거임. 
  @Column({ name: 'email', unique: true, nullable: true, type: 'varchar' })
  loginId: string | null;

  @Column({ unique: true })
  nickname: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  userPhoto: string;

  @Column()
  role: string;
}
