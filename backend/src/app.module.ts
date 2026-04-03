import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: 5432,
      username: 'user', // 본인의 DB 사용자 이름
      password: 'password', // 본인의 DB 비밀번호
      database: 'my_db', // 본인의 DB 이름
      entities: [User], // 우리가 만든 Entity 등록
      synchronize: true, // Entity 수정 시 DB 테이블 자동 업데이트 (개발용)
    }),
    TypeOrmModule.forFeature([User]), // Repository를 쓰기 위해 필요
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}