/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   apiClient.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/04 10:49:09 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/24 17:47:22 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/'; // gateway 주소
const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

// 찬영님이 요청한 '공통 함수'
const apiClient = async (method : 'get' | 'post' | 'put' | 'delete' | 'patch', url : string, data : any = null) => {
  /*
  try {
    const config = {
      method: method,
      url: `${BASE_URL}${url}`,
      data: data,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    const response = await axios(config);
    return { ...response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "서버 통신 실패"
    };
  }
  */

  const isFormData = data instanceof FormData;

  //재시도를 위해 요청 설정을 함수로 분리
  const createConfig = () => {
    const config: any = {
      method,
      url: `${BASE_URL}${url}`,
      data,
      withCredentials: true,
      headers: {},
    };

    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  };

  //  공통 에러 포맷을 message로 통일
  const normalizeError = (error: any) => ({
    success: false,
    message: error?.response?.data?.message || 'SERVER_ERROR',
  });

  const isSessionExpiredCode = (message: string) =>
    message === 'REFRESH_TOKEN_REQUIRED' ||
    message === 'REFRESH_TOKEN_INVALID' ||
    message === 'REFRESH_TOKEN_EXPIRED' ||
    message === 'REFRESH_SESSION_NOT_FOUND' ||
    message === 'REFRESH_TOKEN_REVOKED';

  try {
    const response = await axios(createConfig());
    return { ...response.data };
  }
  catch (error: any)
  {
    const status = error?.response?.status;
    const code = error?.response?.data?.message;

    // Access Token 만료/부재일 때 모두 refresh 시도
    const shouldTryRefresh =
      status === 401 &&
      (code === 'ACCESS_TOKEN_INVALID' || code === 'ACCESS_TOKEN_REQUIRED') &&
      !url.includes('api/auth/refresh');
    if (shouldTryRefresh) {
      try {
        await axios({
          method: 'post',
          url: `${BASE_URL}api/auth/refresh`,
          data: {},
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const retryResponse = await axios(createConfig()); // 재발급 성공하면 원요청 시도
        return { ...retryResponse.data };
      } catch (refreshError: any) {
        const normalized = normalizeError(refreshError);

        // refresh도 실패하면(토큰 부재/만료/무효) 전역 세션만료 이벤트를 발행해 경고창으로 유도
        if (isSessionExpiredCode(normalized.message)) {
          window.dispatchEvent(
            new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
              detail: { message: normalized.message },
            }),
          );
        }
        return normalized;
      }
    }

    return normalizeError(error);
  }
};

export default apiClient;
