import React from 'react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { useI18n } from '../../i18n/useI18n';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
  theme: any;
}

const AvatarModal = ({ isOpen, onClose, onSelect, theme }: AvatarModalProps) => {
    const { messages } = useI18n();
  if (!isOpen) return null;

  const avatarOptions = [1, 2, 3, 4]; // 추후 API나 상수로 관리

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <Card style={{ width: '320px', padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: theme.colors.text, textAlign: 'center' }}>
          {messages.mySpace.selectAvatar}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          justifyItems: 'center',
          marginBottom: '24px'
        }}>
          {avatarOptions.map((id) => (
            <div 
              key={id} 
              onClick={() => onSelect(id)}
              style={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Avatar size={80} />
            </div>
          ))}
        </div>

        <Button onClick={onClose} style={{ width: '100%' }}>
            {messages.mySpace.cancel}
        </Button>
      </Card>
    </div>
  );
};

export default AvatarModal;