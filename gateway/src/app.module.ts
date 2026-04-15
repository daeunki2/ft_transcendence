/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 14:02:04 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/15 14:02:06 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      // secret: process.env.MY_SECRET_KEY ?? 'default_secret',
      secret: process.env.MY_SECRET_KEY,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
