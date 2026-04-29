/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 19:03:10 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/29 19:03:11 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // 또는 ChatModule

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Gateway에서 설정했더라도, 전체 앱 차원에서 CORS를 허용해주는 것이 안전합니다.
  app.enableCORS({
    origin: '*', // 실배포 시에는 프론트 도메인으로 제한하세요!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Main] Chat Service is running on: http://localhost:${port}`);
}
bootstrap();