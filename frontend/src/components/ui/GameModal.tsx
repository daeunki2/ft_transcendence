/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameModal.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 20:59:15 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/11 21:17:47 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { useI18n } from '../../i18n/useI18n';

interface GameMatchModalProps {
  open: boolean;
  isConnected: boolean;
//   onClose: () => void;
}

export default function GameMatchModal({ open, isConnected, onClose }: GameMatchModalProps) {
  const { theme } = useTheme();
  const { messages } = useI18n();

  const handleDoNothing = () => {};
  
  const spinKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <Modal open={open} onClose={handleDoNothing} closeOnOverlayClick={false}>
	  <style>{spinKeyframes}</style>
      <div
        style={{
          padding: '40px',
          color: theme.colors.text,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div style={{
          width: '50px',
          height: '50px',
          border: `5px solid ${theme.colors.textMuted}33`,
          borderTop: `5px solid ${theme.colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
		
        <h2 style={{ margin: 0 }}>
          {isConnected ? messages.HomePage.connectGameJoin : messages.HomePage.connectGameServer}
        </h2>

        {/* <div style={{ marginTop: '10px' }}>
          <Button 
            onClick={onClose} 
            style={{ backgroundColor: theme.colors.danger, border: 'none' }}
          >
            {messages.common?.cancel || '매칭 취소'}
          </Button>
        </div>
        
        <small style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
          ESC를 누르면 매칭이 취소됩니다.
        </small> */}
      </div>
    </Modal>
  );
}