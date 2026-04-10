/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Logout.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:48:58 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/09 22:51:36 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext.types';

export const useLogout = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext)!; 

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null); // 프론트엔드의 유저 상태도 수동으로 비워주기
    } catch (error) {
      console.error("로그아웃 서버 통신 에러:", error);
    } finally {
      setUser(null); //유저 삭제
      navigate('/login');
	  console.log('로그아웃 성공');
    }
  };

  return { handleLogout };
};