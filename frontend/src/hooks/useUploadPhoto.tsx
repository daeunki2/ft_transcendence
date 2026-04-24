import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateProfile } from './UpdateProfile';
import { userService } from '../services/userService'; // 🟢 서비스 임포트

export function useUploadPhoto() {
  const { user, setUser } = useAuth();
  const { updateProfile, isUpdating: isProfileUpdating } = useUpdateProfile();
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (file: File) => {
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      // 1. userService를 통해 파일 업로드 실행
      const response = await userService.uploadPhoto(formData);

      if (response?.success && response.url) {
        // 2. 업로드 성공해서 받은 URL로 프로필 정보 최종 업데이트
        await updateProfile({ userPhoto: response.url });
		return response.url;
      } else {
        alert("업로드 실패: " + (response?.message || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return { 
    uploadPhoto, 
    isProcessing: isUploading || isProfileUpdating 
  };
}