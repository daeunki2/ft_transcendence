/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LandingPage.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:45 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 18:46:46 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import Button from '../components/ui/Button';
import TopControls from '../components/ui/TopControls';
import FooterLinks from '../components/common/FooterLinks';
import Logo from '../components/common/Logo';
import { useI18n } from '../i18n/useI18n';

function LandingPage() {
  const { messages } = useI18n();
  const navigate = useNavigate();

  return (
    <PageContainer
      header={<TopControls />}
      footer={<FooterLinks />}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          textAlign: 'center',
        }}
      >
        <Logo width="360px" />

        <h1
          style={{
            margin: 0,
            fontSize: '32px',
          }}
        >
          {messages.landing.title}
        </h1>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button onClick={() => navigate('/login')}>
            {messages.landing.login}
          </Button>

          <Button onClick={() => navigate('/register')}>
            {messages.landing.register}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

export default LandingPage;