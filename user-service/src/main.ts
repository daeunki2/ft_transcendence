import { NestFactory } from '@nestjs/core';
import { UserModule } from './users/user.module';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UserModule);
  app.use(cookieParser());

 app.useStaticAssets(join(process.cwd(), 'uploads'), { // process.cwd()는 프로젝트 루트를 의미합니다.
  prefix: '/uploads',
});

  await app.listen(process.env.PORT ?? 4001);
  console.log('connect success with port 4001');
}
bootstrap();
