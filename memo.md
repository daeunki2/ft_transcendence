## 수정
- main.ts
WS 어댑터 등록 순서를 앞으로 이동:
httpsServer 생성 → useWebSocketAdapter → app.init() 순으로 변경
기존 순서는 주석 처리 + 이유 추가
- App.tsx
shouldConnectPresence = isAuthReady && Boolean(currentUserId) 추가
usePresenceSocket(currentUserId, shouldConnectPresence)로 변경
기존 호출 usePresenceSocket(currentUserId)는 주석 처리 + 이유 추가
- usePresenceSocket.tsx
시그니처 변경: (currentUserId, shouldConnect)
연결 조건 변경: if (!shouldConnect || !currentUserId)로 게이팅
기존 if (!currentUserId) 블록은 주석 처리 + 이유 추가
effect deps에 shouldConnect 추가
