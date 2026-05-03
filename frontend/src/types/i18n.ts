/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   i18n.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:47:28 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/24 21:14:50 by chanypar         ###   ########.fr       */
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
    id: string;
    password: string;
    submit: string;
    submitting: string;
    footerText: string;
    footerLink: string;
  };
  register: {
    title: string;
    subtitle: string;
    id: string;
	nick: string;
    password: string;
    confirmPassword: string;
    submit: string;
    submitting: string;
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
    requestsTitle: string;
    noRequests: string;
    accept: string;
    reject: string;
    alertTitle: string;
    requestSent: string;
  };
  chat: {
    inputPlaceholder: string;
    send: string;
  };
  mySpace: {
    title: string;
    editAvatar: string;
    selectAvatar: string;
    submitting: string;
    nickname: string;
    nicknamePlaceholder: string;
    save: string;
    gameHistory: string;
    noGames: string;
    cancel: string;
  };
  privacy: {
    title: string;
    updatedAt: string;
    backButton: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    section3Title: string;
    section3Body: string;
    section4Title: string;
    section4Body: string;
    section5Title: string;
    section5Body: string;
    section6Title: string;
    section6Body: string;
    section7Title: string;
    section7Body: string;
  };
  termsPage: {
    title: string;
    effectiveDate: string;
    backButton: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    section3Title: string;
    section3Body: string;
    section4Title: string;
    section4Body: string;
    section5Title: string;
    section5Body: string;
    section6Title: string;
    section6Body: string;
    section7Title: string;
    section7Body: string;
  };
errors: {
    USER_NOT_FOUND: string;
    INVALID_PASSWORD: string;
    ID_REQUIRED: string;
    PASSWORD_REQUIRED: string;
    CONFIRM_PASSWORD_REQUIRED: string;
    INVALID_PASSWORD_FORMAT: string;
    INVALID_ID_FORMAT: string;
    ALREADY_ONLINE: string;
    INVALID_NICKNAME_FORMAT: string;
    USER_ALREADY_EXISTS: string;
    NICKNAME_ALREADY_EXISTS: string;
    USER_PROFILE_INIT_FAILED: string;
    SERVER_ERROR: string;
    CANNOT_ADD_SELF: string;
    ALREADY_FRIENDS_OR_REQUESTED: string;
    REQUEST_NOT_FOUND: string;
    REQUEST_NOT_PENDING: string;
    FRIEND_NOT_FOUND: string;
    NOT_ACCEPTED_FRIENDSHIP: string;
    FORBIDDEN: string;
    NICKNAME_REQUIRED: string;
    NICKNAME_NOT_ALLOWED: string;
    SESSION_EXPIRED: string;
    IMAGE_FORMAT_NOT_ALLOWED: string;
    TOO_BIG_FILE: string;
  };
  result: {
    success: string;
    false: string;
    goLogin: string;
  };
};
