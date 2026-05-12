import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { GameGateway } from './game.gateway';

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
  providers: [GameGateway],
})
export class AppModule {}
