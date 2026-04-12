import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS 설정 (프론트엔드 허용)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  const jwtService = app.get(JwtService);

  // 2. Auth Service로 토스 (주소가 /auth로 시작하면 4000번으로)
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://auth-service:4000',
      changeOrigin: true,
	  pathRewrite: { '^/api/auth': '' },
    }),
  );

  const verifyAccessToken = createAccessTokenMiddleware(jwtService);

  // 3. User Service로 토스 (주소가 /users로 시작하면 4001번으로)
  app.use(
    '/api/users',
    verifyAccessToken,
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

function createAccessTokenMiddleware(jwtService: JwtService) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const token =
      req.cookies?.accessToken ??
      extractBearerToken(req.headers['authorization']);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'ACCESS_TOKEN_REQUIRED',
      });
    }
    try {
      const payload = jwtService.verify(token);
      req.headers['x-user-id'] = String(payload.sub ?? '');
      if (payload.email) {
        req.headers['x-user-email'] = payload.email as string;
      }
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'ACCESS_TOKEN_INVALID',
      });
    }
  };
}

function extractBearerToken(header?: string | string[]) {
  if (!header) return undefined;
  const value = Array.isArray(header) ? header[0] : header;
  const parts = value.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return undefined;
}
