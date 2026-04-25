/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MySpacePage.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 20:11:36 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/24 22:01:00 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import PageContainer from '../components/ui/PageContainer';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/ui/Alert';
import React from 'react';
// import { useUpdateProfile } from '../hooks/UpdateProfile';
import EditableNickname from '../components/profile/EditableNickname';
import { useUploadPhoto } from '../hooks/useUploadPhoto';

export default function MySpacePage() {
  const { theme } = useTheme();
  const { messages } = useI18n();
  const { user } = useAuth();
  // const { updateProfile } = useUpdateProfile();
  const { uploadPhoto, isProcessing, errorMsg, setErrorMsg } = useUploadPhoto();

  // const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  if (!user) {
    return (
      <PageContainer header={<Navbar />} footer={<FooterLinks />}>
        <div style={{ textAlign: 'center', padding: '50px', color: theme.colors.text }}>
          Loading...
        </div>
      </PageContainer>
    );
  }

  const currentAvatarUrl = user.userPhoto;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
      // 선택 후 input 초기화 (같은 파일 다시 올릴 때를 대비)
      e.target.value = '';
    }
  };

  const pageTitle = messages.mySpace?.title && user.nickname
    ? messages.mySpace.title.replace('{userId}', user.nickname) 
    : "My Space";

  return (
    <PageContainer
      header={<Navbar />}
      footer={<FooterLinks />}
    >

     <Alert 
      open={!!errorMsg} 
      title={pageTitle} // 혹은 '알림' 같은 적절한 타이틀
      message={errorMsg || ''} 
      confirmText={messages.result?.false || "OK"} 
      onClose={() => setErrorMsg(null)} 
      />
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '32px', color: theme.colors.text, textAlign: 'center' }}>
          {pageTitle}
        </h1>

        {/* 프로필 카드 - 아바타 + 닉네임 */}
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 0',
            }}
          >
            {/* 아바타 표시 */}
            <Avatar size={120} url={currentAvatarUrl}/>
            
            {/* 아바타 수정 버튼 하나로 통일 */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              style={{ fontSize: '14px', padding: '10px 20px' }}
            >
              {isProcessing ? messages.mySpace.submitting : messages.mySpace.editAvatar}
            </Button>

            {/* 숨겨진 Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*"
            />

            {/* 닉네임 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <EditableNickname currentNickname={user?.nickname || ''} />
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.text }}>
                {user?.id}
              </span>
            </div>
          </div>
        </Card>

        {/* 게임 히스토리 카드 */}
        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: theme.colors.text }}>
            {messages.mySpace.gameHistory}
          </h2>
          <p style={{ margin: 0, color: theme.colors.textMuted, textAlign: 'center' }}>
            {messages.mySpace.noGames}
          </p>
        </Card>
      </div>

    </PageContainer>
  );
}
