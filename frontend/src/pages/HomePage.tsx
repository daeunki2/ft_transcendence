/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HomePage.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:40 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 21:41:32 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import PageContainer from '../components/ui/PageContainer';
import Card from '../components/ui/Card';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';

export default function HomePage() {
  const { messages } = useI18n();
  const { theme } = useTheme();

  return (
    <PageContainer
      header={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <Navbar />
        </div>
      }
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
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              color: theme.colors.text,
            }}
          >
            {messages.HomePage.pong}
          </h1>
          <p
            style={{
              marginTop: '8px',
              color: theme.colors.textMuted,
              fontSize: '14px',
            }}
          >
            {messages.HomePage.summary}
          </p>
        </div>

        <Card>
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              background: theme.colors.background,
              border: `${theme.borderWidth.thin} solid ${theme.colors.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '40px',
                fontSize: '28px',
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              <span>5</span>
              <span>3</span>
            </div>

            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: '2px',
                transform: 'translateX(-50%)',
                background: theme.colors.border,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '80px',
                background: theme.colors.primary,
              }}
            />

            <div
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '80px',
                background: theme.colors.primary,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: theme.colors.text,
              }}
            />
          </div>
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                color: theme.colors.text,
              }}
            >
              {messages.HomePage.gameruel}
            </h2>
            <p
              style={{
                margin: 0,
                color: theme.colors.textMuted,
                fontSize: '14px',
              }}
            >
            {messages.HomePage.ruel}
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}