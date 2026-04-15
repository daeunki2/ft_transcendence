/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   apiClient.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:09 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/10 17:26:23 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/'; // gateway 주소

// 찬영님이 요청한 '공통 함수'
const apiClient = async (method : 'get' | 'post' | 'put' | 'delete' | 'patch', url : string, data : any = null) => {
  try {
    // 1. 설계도(Config Object) 조립
    const config = {
      method: method,         // 'post', 'get' 등
      url: `${BASE_URL}${url}`, // 전체 주소 완성
      data: data,             // 서버로 보낼 본문 데이터
	    withCredentials: true, // 쿠키가 저장용도!
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // 2. 배달 시작 (기다림)
    const response = await axios(config);

    // 3. 성공 시 데이터만 깔끔하게 반환
    return { ...response.data };
  } catch (error: any) {
    // 에러 발생 시 처리
    return { 
      success: false, 
      error: error.response?.data?.message || "서버 통신 실패" 
    };
  }
};

export default apiClient;
