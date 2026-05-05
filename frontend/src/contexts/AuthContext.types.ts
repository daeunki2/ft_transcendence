import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface UserType {
  userId: string;
  id: string;
  nickname: string;
  userPhoto: string;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  isLoading: boolean;
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 클라이언트 게스트 플래그. 추후 백엔드 게스트 JWT 도입 시 이 키 대신
// /me 응답의 role 으로 갈아끼우면 소비자 코드는 그대로 둘 수 있다.
export const GUEST_STORAGE_KEY = 'guest_mode';
