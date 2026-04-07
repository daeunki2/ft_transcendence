import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS 설정 (프론트엔드 허용)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // 2. Auth Service로 토스 (주소가 /auth로 시작하면 4000번으로)
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://auth-service:4000',
      changeOrigin: true,
	  pathRewrite: { '^/api/auth': '' },
    }),
  );

  // 3. User Service로 토스 (주소가 /users로 시작하면 4001번으로)
  app.use(
    '/api/users',
    createProxyMiddleware({
      target: 'http://user-service:4001',
      changeOrigin: true,
	  pathRewrite: { '^/api/users': '' },
    }),
  );

  await app.listen(8000);
  console.log('API Gateway is running on http://localhost:8000');
}
bootstrap();