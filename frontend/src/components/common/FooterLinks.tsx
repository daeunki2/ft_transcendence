/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FooterLinks.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:26 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 18:46:27 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/useTheme';
import { useI18n } from '../../i18n/useI18n';

function FooterLinks() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { messages } = useI18n();

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        fontSize: '14px',
        color: theme.colors.textMuted,
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/terms')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          color: 'inherit',
          fontFamily: theme.font.family,
          fontSize: '14px',
        }}
      >
        {messages.footer.terms}
      </button>

      <button
        type="button"
        onClick={() => navigate('/privacy')}  
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          color: 'inherit',
          fontFamily: theme.font.family,
          fontSize: '14px',
        }}
      >
        {messages.footer.privacy}
      </button>
    </div>
  );
}

export default FooterLinks;