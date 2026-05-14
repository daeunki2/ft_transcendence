import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { GameGateway } from './game.gateway';
import { RedisModule } from './redis/redis.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

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
    RedisModule,
    MatchmakingModule,
  ],
  providers: [GameGateway],
})
export class AppModule {}
