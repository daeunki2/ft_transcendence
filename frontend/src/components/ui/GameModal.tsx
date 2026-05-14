/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameModal.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 20:59:15 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/14 18:20:47 by daeunki2         ###   ########.fr       */
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
  // daeunki2수정 : 수정이유
  // 부모(HomePage)에서 onClose를 전달하고 있으므로 props 타입에도 명시해 타입 불일치(암묵 any/속성 누락)를 방지
  onClose: () => void;
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
          {isConnected ? messages.game.connectGameJoin : messages.game.connectGameServer}
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
