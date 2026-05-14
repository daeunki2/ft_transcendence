import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { GameGateway } from './game.gateway';
import { GameEngineService } from './engine/game-engine.service'; // daeunki2 추가 : 게임 로직 추가
import { GameRecordEntity } from './game-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'game-database',
      port: 5432,
      username: process.env.GAMEDB_USER,
      password: process.env.GAMEDB_PASSWORD,
      database: 'game-db',
      entities: [GameRecordEntity], // daeunki2수정 : 수정이유 - 게임 결과를 DB 테이블에 영속 저장
      synchronize: true,
    }),
    TypeOrmModule.forFeature([GameRecordEntity]), // daeunki2수정 : 수정이유 - Gateway에서 결과 저장용 Repository 주입
    HealthModule,
  ],
  providers: [GameGateway, GameEngineService], // daeunki2 추가 : 게임 로직 추가
})
export class AppModule {}
