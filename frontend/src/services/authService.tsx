import apiClient from './apiClient';

export const authService = {
  // 로그인 기능: 'post' 방식과 '/login' 주소를 지정해서 공통 함수 호출
  login: async (email: string, password: string) => {
    return await apiClient('post', '/login', { email, password });
  },

  // 회원가입 기능
  signup: async (userData: any) => {
    return await apiClient('post', '/signup', userData);
  },

  // 로그아웃 기능
  logout: async () => {
    return await apiClient('post', '/logout');
  }
};