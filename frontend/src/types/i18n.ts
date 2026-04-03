/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   i18n.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:47:28 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/23 18:31:04 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type Locale = 'en' | 'ko' | 'fr';

export type Messages = {
  landing: {
    title: string;
    login: string;
    register: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    footerText: string;
    footerLink: string;
  };
  register: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    submit: string;
    footerText: string;
    footerLink: string;
  };
  footer: {
    terms: string;
    privacy: string;
  };
  
  navbar: {
    mySpace : string;
    pong : string;
    social : string;
    logout : string;
  };
    HomePage: {
    pong : string;
    summary : string;
    match : string;
    aiGame : string;
    gameRule : string;
    rule : string;
  };
  social: {
    title: string;
    addPlaceholder: string;
    add: string;
    sendMessage: string;
    startGame: string;
    noFriends: string;
    remove: string;
  };
  chat: {
    inputPlaceholder: string;
    send: string;
  };
  mySpace: {
    title: string;
    editAvatar: string;
    nickname: string;
    nicknamePlaceholder: string;
    save: string;
    gameHistory: string;
    noGames: string;
  };
};