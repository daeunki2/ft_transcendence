import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.types';
import { authService } from '../services/authService';

// 변경할 수 있는 필드들을 정의 (Partial을 써서 선택적으로 받음)
interface UpdateFields {
  userPhoto?: number;
  nickname?: string;
}

export const useUpdateProfile = () => {
  const context = useContext(AuthContext);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!context) throw new Error('AuthProvider를 확인해주세요.');
  const { setUser } = context;

  const updateProfile = async (fields: UpdateFields) => {
    setIsUpdating(true);
    try {
      // 1. 서버에 수정된 필드들만 전송
      const response = await authService.updateProfile(fields);

      if (response?.success) {
        // 2. 서버 성공 시 Context 상태 업데이트
        // 기존 유저 데이터(prev) 위에 새로운 필드(fields)를 덮어씌움
        setUser((prev) => (prev ? { ...prev, ...fields } : null));
        return true;
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    } finally {
      setIsUpdating(false);
    }
    return false;
  };

  return { updateProfile, isUpdating };
};