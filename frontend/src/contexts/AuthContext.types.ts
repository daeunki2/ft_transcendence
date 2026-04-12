import { createContext } from 'react';

export interface UserType {
  userId: string;
  email: string;
  nickname: string;
  userPhoto: number;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);