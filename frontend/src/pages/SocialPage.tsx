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

import { useState, useEffect, useCallback } from 'react';
import PageContainer from '../components/ui/PageContainer';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import ChatModal from '../components/ui/ChatModal';
import Alert from '../components/ui/Alert';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';
import { userService } from '../services/userService';
import { friendService, type FriendItem } from '../services/friendService';
import { AVATAR_MAP } from '../constants/Avatars';

function SocialPage() {
  const { theme } = useTheme();
  const { messages } = useI18n();
  const [chatTarget, setChatTarget] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [requests, setRequests] = useState<FriendItem[]>([]);
  const [nicknameInput, setNicknameInput] = useState('');
  // 백엔드 에러 코드를 그대로 저장 → 렌더 시 i18n으로 변환
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // 에러 코드를 현재 언어 메세지로 변환. 알 수 없는 코드면 SERVER_ERROR로 fallback.
  const translateError = (code: string): string => {
    const errs = messages.errors as Record<string, string>;
    return errs[code] ?? errs.SERVER_ERROR;
  };

  // 친구/요청 목록 새로고침
  const refresh = useCallback(async () => {
    try {
      const [f, r] = await Promise.all([
        friendService.getFriends(),
        friendService.getRequests(),
      ]);
      setFriends(f);
      setRequests(r);
    } catch (err: any) {
      console.error('Failed to load friends:', err);
    }
  }, []);

  // 마운트 시: 현재 사용자 id 조회 후 목록 로드
  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getMe();
        const uid = me?.user?.userId;
        if (typeof uid !== 'string') {
          console.error('[소셜] uid가 string이 아님, 중단', me);
          return;
        }
        setCurrentUserId(uid);
        await refresh();
      } catch (err) {
        console.error(err);
      }
    })();
  }, [refresh]);

  // 친구 요청 보내기
  const handleSendRequest = async () => {
    console.log('[친구추가] 버튼 클릭됨, currentUserId:', currentUserId);
    if (currentUserId === null) {
      console.warn('[친구추가] currentUserId가 null이라 중단');
      return;
    }
    const nickname = nicknameInput.trim();
    if (!nickname) {
      setErrorCode('NICKNAME_REQUIRED');
      return;
    }
    try {
      await friendService.sendRequest(nickname);
      setNicknameInput('');
      await refresh();
    } catch (err: any) {
      setErrorCode(err.message);
    }
  };

  // 친구 요청 수락
  const handleAccept = async (friendId: number) => {
    if (currentUserId === null) return;
    try {
      await friendService.acceptRequest(friendId);
      await refresh();
    } catch (err: any) {
      setErrorCode(err.message);
    }
  };

  // 친구 요청 거절
  const handleReject = async (friendId: number) => {
    if (currentUserId === null) return;
    try {
      await friendService.rejectRequest(friendId);
      await refresh();
    } catch (err: any) {
      setErrorCode(err.message);
    }
  };

  // 친구 삭제
  const handleRemove = async (friendId: number) => {
    if (currentUserId === null) return;
    try {
      await friendService.removeFriend(friendId);
      await refresh();
    } catch (err: any) {
      setErrorCode(err.message);
    }
  };

  return (
    <PageContainer
      header={<Navbar />}
      footer={<FooterLinks />}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* 왼쪽: 기존 친구 목록 영역 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
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
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendRequest();
              }}
            />
            <Button onClick={handleSendRequest}>{messages.social.add}</Button>
          </div>

          {/* 친구 목록 */}
          <Card>
          {friends.length === 0 ? (
            <p style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
              {messages.social.noFriends}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map((friend) => (
                <div
                  key={friend.friendId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: `${theme.borderWidth.thin} solid ${theme.colors.border}`,
                  }}
                >
                  <Avatar url={AVATAR_MAP[friend.userPhoto]} />
                  <span style={{ flex: 1, fontSize: '16px', color: theme.colors.text }}>
                    {friend.nickname}
                  </span>
                  <Button
                    onClick={() => setChatTarget(friend.nickname)}
                    style={{ fontSize: '12px', padding: '8px 12px', minHeight: 'auto' }}
                  >
                    {messages.social.sendMessage}
                  </Button>
                  <Button style={{ fontSize: '12px', padding: '8px 12px', minHeight: 'auto' }}>
                    {messages.social.startGame}
                  </Button>
                  <Button
                    onClick={() => handleRemove(friend.friendId)}
                    style={{
                      fontSize: '12px',
                      padding: '8px 12px',
                      minHeight: 'auto',
                      background: theme.colors.danger,
                      color: '#ffffff',
                    }}
                  >
                    {messages.social.remove}
                  </Button>
                </div>
              ))}
            </div>
          )}
          </Card>
        </div>

        {/* 오른쪽: 친구 요청 카드 (작게) */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* 왼쪽 title과 같은 높이의 invisible spacer — 카드 상단을 입력바에 정렬 */}
          <h1
            aria-hidden
            style={{
              margin: 0,
              fontSize: '32px',
              visibility: 'hidden',
              pointerEvents: 'none',
            }}
          >
            &nbsp;
          </h1>
          <Card style={{ padding: '16px' }}>
            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                color: theme.colors.text,
              }}
            >
              {messages.social.requestsTitle}
            </h2>

            {requests.length === 0 ? (
              <p
                style={{
                  color: theme.colors.textMuted,
                  textAlign: 'center',
                  fontSize: '13px',
                  margin: 0,
                }}
              >
                {messages.social.noRequests}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requests.map((req) => (
                  <div
                    key={req.friendId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 0',
                      borderBottom: `${theme.borderWidth.thin} solid ${theme.colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: '13px',
                        color: theme.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {req.nickname}
                    </span>
                    <Button
                      onClick={() => handleAccept(req.friendId)}
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        minHeight: 'auto',
                      }}
                    >
                      {messages.social.accept}
                    </Button>
                    <Button
                      onClick={() => handleReject(req.friendId)}
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        minHeight: 'auto',
                        background: theme.colors.danger,
                        color: '#ffffff',
                      }}
                    >
                      {messages.social.reject}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ChatModal
        open={chatTarget !== null}
        onClose={() => setChatTarget(null)}
        friendName={chatTarget ?? ''}
      />

      <Alert
        open={errorCode !== null}
        title={messages.social.alertTitle}
        message={errorCode ? translateError(errorCode) : ''}
        confirmText={messages.result.false}
        onClose={() => setErrorCode(null)}
      />
    </PageContainer>
  );
}

export default SocialPage;