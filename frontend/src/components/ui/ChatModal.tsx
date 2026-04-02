import type { CSSProperties } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Avatar from './Avatar';
import { useTheme } from '../../theme/useTheme';
import { useI18n } from '../../i18n/useI18n';

type ChatModalProps = {
  open: boolean;
  onClose: () => void;
  friendName: string;
};

const fakeChatHistory = [
  { id: 1, from: 'them' as const, text: 'Hey! Want to play a game?' },
  { id: 2, from: 'me' as const, text: 'Sure, let me finish this round first.' },
  { id: 3, from: 'them' as const, text: 'No problem, take your time!' },
];

export default function ChatModal({ open, onClose, friendName }: ChatModalProps) {
  const { theme } = useTheme();
  const { messages } = useI18n();

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderBottom: `${theme.borderWidth.thin} solid ${theme.colors.border}`,
  };

  const bodyStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const footerStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `${theme.borderWidth.thin} solid ${theme.colors.border}`,
  };

  const bubbleBase: CSSProperties = {
    maxWidth: '75%',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  };

  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <div style={headerStyle}>
        <Avatar size={32} />
        <span style={{ flex: 1, color: theme.colors.text, fontWeight: 600, fontSize: '15px' }}>
          {friendName}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.textMuted,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          X
        </button>
      </div>

      {/* Messages */}
      <div style={bodyStyle}>
        {fakeChatHistory.map((msg) => {
          const isMine = msg.from === 'me';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...bubbleBase,
                  background: isMine ? theme.colors.primary : theme.colors.background,
                  color: isMine ? theme.colors.primaryText : theme.colors.text,
                  borderRadius: theme.radius.md || '8px',
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input (껍데기만) */}
      <div style={footerStyle}>
        <Input
          placeholder={messages.chat.inputPlaceholder}
          style={{ flex: 1 }}
        />
        <Button style={{ fontSize: '13px', padding: '8px 14px', minHeight: 'auto' }}>
          {messages.chat.send}
        </Button>
      </div>
    </Modal>
  );
}
