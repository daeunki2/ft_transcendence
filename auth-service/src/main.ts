import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  app.use(cookieParser());
  app.enableCors({
    origin: frontendOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    });
  await app.listen(process.env.PORT ?? 4000);
  console.log('connect success with port 4000');
}
bootstrap();
