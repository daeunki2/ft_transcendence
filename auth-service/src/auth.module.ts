import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { RefreshSession } from './entities/refresh-session.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [

	ConfigModule.forRoot({ // 다른 모듈에서도 .env변수 사용위함
      isGlobal: true, 
    }),

    // HttpModule 추가 (다른 서비스 API 호출용)
    HttpModule.register({
      timeout: 5000,     // 5초 타임아웃 설정 (선택사항)
      maxRedirects: 5,   // 최대 리다이렉트 횟수 (선택사항)
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'auth-database',
      port: 5432,
      username: 'user', // 본인의 DB 사용자 이름
      password: 'password', // 본인의 DB 비밀번호
      database: 'auth-db', // 본인의 DB 이름
      entities: [Auth, RefreshSession], // 우리가 만든 Entity 등록 + 리프레시 추가
      synchronize: true, // Entity 수정 시 DB 테이블 자동 업데이트 (개발용)
    }),
    TypeOrmModule.forFeature([Auth, RefreshSession]), // Repository를 쓰기 위해 필요 + 리프레시 추가

	JwtModule.register({
      secret: process.env.MY_SECRET_KEY, // .env 파일로 생성해야함!
      signOptions: { expiresIn: '1h' }, // 토큰 유효 기간 (1시간)
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
