/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Register.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:06 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/07 18:26:01 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useI18n } from '../i18n/useI18n';

export const useRegister = () => {
  const navigate = useNavigate();
  const { messages } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nick, setNick] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const [alertMsg, setAlertMsg] = useState<string | null>(null);
  
const handleRegister = async () => {
    if (password !== confirmPassword) {
      //alert("비밀번호가 일치하지 않습니다.");
    setAlertMsg(messages.errors?.INVALID_PASSWORD);
      return;
    }
    setIsLoading(true);
    try {
    	const result = await authService.signup({ email, password, nick });

    	if (result.success) {
        //alert("회원가입 성공! 로그인해 주세요.");
        setAlertMsg(messages.result?.success || "Success!");
        //지금은 이메일 중복만 경고하고 있음 나중에 닉네임 중복도 추가해야 할지도?
        navigate('/login');
      	} else {
          setAlertMsg(result.message);
          console.log("회원가입 실패 사유:", result);
      	}
    } catch (error) {
      console.error("회원가입 에러:", error);
      setAlertMsg(messages.errors?.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    nick,
    setNick,
    confirmPassword,
    setConfirmPassword,
	  isLoading,
    handleRegister,
    alertMsg,
    setAlertMsg
  };
};