/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MySpacePage.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 20:11:36 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/10 18:15:09 by chanypar         ###   ########.fr       */
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
import React, { useState } from 'react';
import AvatarModal from '../components/modals/AvatarModal';
import { AVATAR_MAP } from '../constants/Avatars';
import { useUpdateProfile } from '../hooks/UpdateProfile';
import EditableNickname from '../components/profile/EditableNickname';

export default function MySpacePage() {
  const { theme } = useTheme();
  const { messages } = useI18n();
  const { user } = useAuth();
  const { updateProfile } = useUpdateProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!user) {
    return (
      <PageContainer header={<Navbar />} footer={<FooterLinks />}>
        <div style={{ textAlign: 'center', padding: '50px', color: theme.colors.text }}>
        </div>
      </PageContainer>
    );
  }
  const currentAvatarUrl = AVATAR_MAP[user.userPhoto];

  const handleAvatarSelect = async (id: number) => {

    await updateProfile({ userPhoto: id });
    console.log(`Selected Avatar ID: ${id}`);
    // 여기서 유저 정보 업데이트 로직 실행
    setIsModalOpen(false);
  };

  return (
    <PageContainer
      header={<Navbar />}
      footer={<FooterLinks />}
    >
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
          {messages.mySpace.title}
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
            {/* 아바타 */}
            <Avatar size={120} url={currentAvatarUrl}/>
            <Button
              onClick={() => setIsModalOpen(true)}
              style={{ fontSize: '12px', padding: '8px 16px', minHeight: 'auto' }}
            >
              {messages.mySpace.editAvatar}
            </Button>

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

      <AvatarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleAvatarSelect}
        theme={theme}
      />
    </PageContainer>
  );
}
