/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Login.tsx                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:02 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/04 11:05:20 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext)!; //  유저를 저장하기위한 전역 주머니
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async () => {

	setIsLoading(true);
	try {
		const result = await authService.login(email, password);
  
		if (result.success === true) {
		setUser(result.user);
	  	console.log('로그인 성공:', result.message);
	  	console.log('토큰:', result.accessToken);
	  
		// localStorage.setItem('accessToken', result.accessToken); 백엔드에서 바로 쿠키저장
	  
	  	navigate('/home');
		}
	else { 
		alert(result.error || "로그인에 실패했습니다.");}
  	} catch(error) {
	console.error('로그인 에러:', error);
	alert("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
	} finally {
		setIsLoading(false);
	}
};

// 컴포넌트에서 필요한 것들만 내보냅니다.
  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    isLoading
  };
};