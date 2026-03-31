/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SocialPage.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 20:11:59 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 20:14:57 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import PageContainer from '../components/ui/PageContainer';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';

const fakeFriends = [
  { id: 1, nickname: 'Player42' },
  { id: 2, nickname: 'PongMaster' },
  { id: 3, nickname: 'RetroGamer' },
];

function SocialPage() {
  const { theme } = useTheme();
  const { messages } = useI18n();

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
          {messages.social.title}
        </h1>

        {/* 친구 추가 영역 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            placeholder={messages.social.addPlaceholder}
            style={{ flex: 1 }}
          />
          <Button>{messages.social.add}</Button>
        </div>

        {/* 친구 목록 */}
        <Card>
          {fakeFriends.length === 0 ? (
            <p style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
              {messages.social.noFriends}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fakeFriends.map((friend) => (
                <div
                  key={friend.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: `${theme.borderWidth.thin} solid ${theme.colors.border}`,
                  }}
                >
                  {/* 아바타 자리 (나중에 컴포넌트로 교체) */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: theme.colors.primary,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, fontSize: '16px', color: theme.colors.text }}>
                    {friend.nickname}
                  </span>
                  <Button style={{ fontSize: '12px', padding: '8px 12px', minHeight: 'auto' }}>
                    {messages.social.sendMessage}
                  </Button>
                  <Button style={{ fontSize: '12px', padding: '8px 12px', minHeight: 'auto' }}>
                    {messages.social.startGame}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

export default SocialPage;