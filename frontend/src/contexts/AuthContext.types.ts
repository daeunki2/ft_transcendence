import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface UserType {
  userId: string;
  loginId: string;
  nickname: string;
  userPhoto: string;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
