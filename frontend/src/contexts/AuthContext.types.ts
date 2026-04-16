import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface UserType {
  userId: string;
  email: string;
  nickname: string;
  userPhoto: number;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
