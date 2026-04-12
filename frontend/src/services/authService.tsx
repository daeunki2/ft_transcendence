/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authService.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:14 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/10 17:28:17 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import apiClient from './apiClient';

export const authService = {
  // 로그인 기능: 'post' 방식과 '/login' 주소를 지정해서 공통 함수 호출
  login: async (email: string, password: string) => {
    return await apiClient('post', 'api/auth/login', { email, password});
  },

  // 회원가입 기능
  signup: async (userData: any) => {
    return await apiClient('post', 'api/auth/signup', userData);
  },

  // 로그아웃 기능
  logout: async () => {
    return await apiClient('post', 'api/auth/logout', {});
  }
};