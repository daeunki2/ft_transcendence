/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authService.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:14 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/04 12:46:49 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import apiClient from './apiClient';

export const authService = {
  // 로그인 기능: 'post' 방식과 '/login' 주소를 지정해서 공통 함수 호출
  login: async (email: string, password: string) => {
    return await apiClient('post', '/login', { email, password});
  },

  // 회원가입 기능
  signup: async (userData: any) => {
    return await apiClient('post', '/signup', userData);
  },

  // 로그아웃 기능
  logout: async () => {
    return await apiClient('post', '/logout', {});
  },
  
  // 로그인한 유저 정보 가져오기
  getMe: async () => {
    // 세 번째 인자(data)는 GET이라서 비워두거나 생략합니다.
    return await apiClient('get', '/me', {});
  }
};