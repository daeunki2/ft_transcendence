import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'game_records' })
export class GameRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  player1Id: string;

  @Column({ type: 'varchar', length: 64 })
  player2Id: string;

  @Column({ type: 'varchar', length: 64 })
  winnerId: string;

  @Column({ type: 'varchar', length: 64 })
  loserId: string;

  @Column({ type: 'varchar', length: 64 })
  winnerNickname: string;

  @Column({ type: 'varchar', length: 64 })
  loserNickname: string;

  @Column({ type: 'int' })
  player1Score: number;

  @Column({ type: 'int' })
  player2Score: number;

  @Column({ type: 'varchar', length: 16 })
  endedReason: 'normal' | 'forfeit';

  @CreateDateColumn({ type: 'timestamptz' })
  playedAt: Date;
}
