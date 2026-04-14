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
      // 개발 환경에서는 auth-service 컨테이너의 도메인을 그대로 쓰면
      // 브라우저가 쿠키를 저장하지 못하므로 localhost로 재작성한다.
      cookieDomainRewrite: {
        '*': 'localhost',
      },
      // 원본 코드:
      // onProxyRes(proxyRes) {
      //   const cookies = proxyRes.headers['set-cookie'];
      //   if (!cookies) {
      //     return;
      //   }
      //   proxyRes.headers['set-cookie'] = cookies.map((cookie) => {
      //     // dev 환경에서는 HTTPS가 아니므로 Secure 플래그를 제거해 쿠키 저장을 허용한다.
      //     let updated = cookie.replace(/;\s*secure/gi, '');
      //     // SameSite=None은 Secure 플래그와 함께 써야 하므로, Secure를 뗀 경우 Lax로 강제 변환한다.
      //     if (/;\s*samesite=none/gi.test(updated)) {
      //       updated = updated.replace(/;\s*samesite=none/gi, '; SameSite=Lax');
      //     }
      //     return updated;
      //   });
      // },
      on: {
        proxyRes(proxyRes) {
          const cookies = proxyRes.headers['set-cookie'];
          if (!cookies) {
            return;
          }
          const cookieList = Array.isArray(cookies) ? cookies : [cookies];
          proxyRes.headers['set-cookie'] = cookieList.map((cookie) => {
            // dev 환경에서는 HTTPS가 아니므로 Secure 플래그를 제거해 쿠키 저장을 허용한다.
            let updated = cookie.replace(/;\s*secure/gi, '');
            // SameSite=None은 Secure 플래그와 함께 써야 하므로, Secure를 뗀 경우 Lax로 강제 변환한다.
            if (/;\s*samesite=none/gi.test(updated)) {
              updated = updated.replace(/;\s*samesite=none/gi, '; SameSite=Lax');
            }
            return updated;
          });
        },
      },
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
