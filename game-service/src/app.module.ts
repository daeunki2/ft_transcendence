import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { GameGateway } from './game.gateway';
import { GameEngineService } from './engine/game-engine.service'; // daeunki2 추가 : 게임 로직 추가

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
      entities: [],
      synchronize: true,
    }),
    HealthModule,
  ],
  providers: [GameGateway, GameEngineService], // daeunki2 추가 : 게임 로직 추가
})
export class AppModule {}
