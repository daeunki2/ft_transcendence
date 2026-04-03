/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MySpacePage.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 20:11:36 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/03 00:00:00 by daeunki2         ###   ########.fr       */
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

export default function MySpacePage() {
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
            <Avatar size={120} />
            <Button
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
              <span style={{ fontSize: '14px', color: theme.colors.textMuted }}>
                {messages.mySpace.nickname}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.text }}>
                Player1
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
