import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.MY_SECRET_KEY ?? 'default_secret',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
