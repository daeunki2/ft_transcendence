import React, { useState } from 'react';
import Button from '../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { useI18n } from '../../i18n/useI18n';
import { useUpdateProfile } from '../../hooks/UpdateProfile';

interface EditableNicknameProps {
  currentNickname: string;
}

export default function EditableNickname({ currentNickname }: EditableNicknameProps) {
  const { theme } = useTheme();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const { messages } = useI18n();
  
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempNickname, setTempNickname] = useState(currentNickname);

  const handleSave = async () => {
    if (!tempNickname.trim() || tempNickname === currentNickname) {
      setIsEditing(false);
      return;
    }
    const success = await updateProfile({ nickname: tempNickname });
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNickname(currentNickname);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={tempNickname}
          onChange={(e) => setTempNickname(e.target.value)}
          style={{
            padding: '4px 8px',
            fontSize: '18px',
            borderRadius: '4px',
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            outline: 'none'
          }}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Button onClick={handleSave} disabled={isUpdating} style={{ minHeight: '32px', padding: '0 12px' }}>
          {messages.mySpace.save}
        </Button>
        <Button onClick={handleCancel} style={{ minHeight: '32px', padding: '0 12px', background: '#ccc' }}>
          {messages.mySpace.cancel}
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.text }}>
        {currentNickname}
      </span>
      <button 
        onClick={() => setIsEditing(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
      >
        ✏️
      </button>
    </div>
  );
}