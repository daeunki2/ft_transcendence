
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/users';

// 친구 목록/요청 응답 항목
export interface FriendItem {
  friendId: number;
  userId: string;
  nickname: string;
}

// TODO: JWT 인증 도입 시 이 헬퍼 + x-user-id 헤더 모두 제거하고
//       쿠키 기반 인증으로 전환할 것 (백엔드 JwtAuthGuard와 함께)
const buildHeaders = (userId: string) => ({
  'Content-Type': 'application/json',
  'x-user-id': String(userId),
});

// 백엔드는 에러 코드(예: 'USER_NOT_FOUND')를 message 필드로 보낸다.
// 프론트는 그 코드를 그대로 throw하고, 호출 측에서 i18n 매핑을 수행한다.
const handleError = (error: any): never => {
  const code = error.response?.data?.message || 'SERVER_ERROR';
  throw new Error(code);
};

export const friendService = {
  // 내 친구 목록 조회
  getFriends: async (userId: string): Promise<FriendItem[]> => {
    try {
      const res = await axios.get(`${BASE_URL}/friends`, {
        headers: buildHeaders(userId),
        withCredentials: true,
      });
      return res.data;
    } catch (error: any) {
      return handleError(error);
    }
  },

  // 받은 친구 요청 목록 조회
  getRequests: async (userId: string): Promise<FriendItem[]> => {
    try {
      const res = await axios.get(`${BASE_URL}/friends/requests`, {
        headers: buildHeaders(userId),
        withCredentials: true,
      });
      return res.data;
    } catch (error: any) {
      return handleError(error);
    }
  },

  // 친구 요청 보내기
  sendRequest: async (userId: string, nickname: string) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/friends/requests`,
        { nickname },
        { headers: buildHeaders(userId), withCredentials: true },
      );
      return res.data;
    } catch (error: any) {
      return handleError(error);
    }
  },

  // 친구 요청 수락
  acceptRequest: async (userId: string, friendId: number) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/friends/requests/${friendId}`,
        {},
        { headers: buildHeaders(userId), withCredentials: true },
      );
      return res.data;
    } catch (error: any) {
      return handleError(error);
    }
  },

  // 친구 요청 거절
  rejectRequest: async (userId: string, friendId: number) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/friends/requests/${friendId}`,
        { headers: buildHeaders(userId), withCredentials: true },
      );
      return res.data;
    } catch (error: any) {
      return handleError(error);
    }
  },

  // 친구 삭제
  removeFriend: async (userId: string, friendId: number) => {
    try {
      const res = await axios.delete(`${BASE_URL}/friends/${friendId}`, {
        headers: buildHeaders(userId),
        withCredentials: true,
      });
      return res.data;
    } catch (error: any) {
      return handleError(error);
    }
  },
};
