/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Login.tsx                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:02 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/05 22:34:36 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';
import { useI18n } from '../i18n/useI18n';

export const useLogin = () => {
  const navigate = useNavigate();
	const { messages } = useI18n(); //언어 추가
  const { setUser } = useContext(AuthContext)!; //  유저를 저장하기위한 전역 주머니
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // 초기화

const handleLogin = async () => {

	setIsLoading(true);
	setErrorMsg(null); // 메세지 초기화
	
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
	const translated = (messages.errors as any)[result.message] || messages.result.false;
        setErrorMsg(translated);
	}
  	} catch(error) {
	console.error('로그인 에러:', error);
	setErrorMsg(messages.errors.SERVER_ERROR);
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
    isLoading,
	errorMsg,
    setErrorMsg
  };
};