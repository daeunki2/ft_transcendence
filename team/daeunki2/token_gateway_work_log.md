## 작업 전 합의된 사항

1. 토큰은 엑세스 리프레시 2개. 2개 다 쿠키에 저장. 리프레시의 경우 세션관리를 위해 db에도 저장
2. 게이트웨이에서 인증 진행 이후 다른 서비스로 진행.
3. 마이크로 서비스 정의에 맞게 서비스별로 디비 따로 가지기.

## 작업 진행 전
1. 토큰 재발급은 어디서 진행하지? 게이트웨이 vs 인증 >>> 인증! 
> 게이트웨이이는 토큰의 유효성 여부만 판단하고 토큰과 관련된 부분은 하나로 모는것이 효율적이라 판단함. 
> 생성 재발급 삭제 블랙리스트등 토큰과 관련된 작업들은 인증서비스에 몰아주었음. 

## 작업 진행 
1. 토큰 생성 
2. 토큰 재발급
3. 토큰 삭제
4. 블랙리스트
5. redis
6. 게이트웨이 인증
7. 만료된 at토큰 재발급 (rt활용하여서 진행, rt도 만료면 재로그인 아니라면  기존 rt블랙리스트 후 rt, at, 재발급.)
8. 세션 만료 전역 경고창(재로그인 유도 버튼)
9. (추가) 비밀번호와 아이디 입력 받을때 약간의 제한 >> 나중에 더 강한 보안 필요 + 사용자한테 뭐 받을때 기본적인 보안 필요. 
10. (추가) 개인정보 이용약관 페이지
11. (추가) 닉네임 금칙어 적용(노골적인 욕설방지, 원하시는 단어 있으면 자유롭게 추가하세요!)
12. (추가) 프론트엔드 라우트가드 (로그인 이후 페이지들)
13. (추가) 의도된 로그아웃과 세션만료 분리 + 보호 라우트 진입 시 1회 재검증

## 쿠키 보는법
- f12 > 어플리케이션 > 쿠키. 여기서 작은 삼각형을 클릭하면 밑에 주소가 나옴. 그 주소에 쿠키 있음. 우리의 경우 프론트인 5173에 쿠키 2개 있음. 

### 생각해볼 내용
1. 보안을 어디까지 얼마나 더 해야하지?
2. 닉네임은 중복이 허용된다면, 친구추가할때 어떻게 보여주지?
3.  토큰 만료/부재 처리 일관화를 위해 추후 통일 범위 협의 필요.
토큰 2개(AT/RT) 모두 없는 경우, 다른 서비스에서도 동일하게 `401 -> refresh 실패 코드 -> 전역 세션만료 처리 -> 재로그인 유도` 흐름을 공통 클라이언트 기준으로 강제할지(서비스별 예외 허용 여부 포함)
현재는 페이지 기준으로만 튕기게 해둠


-------------------------------------------

## 작업 단위별 파일 정리

1. 토큰 생성
- `auth-service/src/auth.service.ts` (login에서 access/refresh 발급)
- `auth-service/src/auth.controller.ts` (login 응답 시 쿠키 저장)
- `auth-service/src/auth.module.ts` (JWT 모듈 설정)

2. 토큰 재발급
- `auth-service/src/auth.service.ts` (refresh 로직, 세션 검증/토큰 재발급)
- `auth-service/src/auth.controller.ts` (`POST /refresh`, 쿠키 재설정)

3. 토큰 삭제
- `auth-service/src/auth.service.ts` (logout에서 세션 삭제)
- `auth-service/src/auth.controller.ts` (`POST /logout`, 쿠키 만료 처리)

4. 블랙리스트
- `auth-service/src/auth.service.ts` (refresh blacklist key/조회/등록 로직)

5. redis
- `auth-service/src/redis/redis.module.ts` (Redis 클라이언트 생성/종료)
- `auth-service/src/auth.module.ts` (RedisModule 등록)
- `auth-service/src/auth.service.ts` (Redis 주입 후 blacklist 사용)

6. 게이트웨이 인증
- `gateway/src/main.ts` (Access Token 검증 미들웨어, `x-user-id` 주입, user-service 프록시 보호)
- `gateway/src/app.module.ts` (JWT secret 설정)

7. 만료된 at토큰 재발급 (rt 활용)
- `frontend/src/services/apiClient.tsx` (`401 + ACCESS_TOKEN_INVALID/ACCESS_TOKEN_REQUIRED` 수신 시 `POST /api/auth/refresh` 호출 후 원요청 1회 재시도)
- `frontend/src/services/authService.tsx` (`refresh()` 메서드 추가, 재발급 엔드포인트 공통 호출)
- `frontend/src/hooks/useAuthInit.tsx` (재발급 실패/인증 실패 시 `setUser(null)`로 로그인 상태 정리)
- `auth-service/src/auth.service.ts` (refresh에서 RT 검증, old RT 블랙리스트 등록, 새 AT/RT 발급 및 세션 갱신)
- `auth-service/src/auth.controller.ts` (refresh 성공 시 새 AT/RT 쿠키 재설정)

8. 세션 만료 전역 경고창 + 재로그인 유도
- `frontend/src/services/apiClient.tsx` (refresh 실패 시 `auth:session-expired` 이벤트 발행)
- `frontend/src/App.tsx` (전역 `Alert` 표시, 확인 버튼 클릭 시 `/login` 이동)
- `frontend/src/types/i18n.ts` (`errors.SESSION_EXPIRED`, `result.goLogin` 타입 추가)
- `frontend/src/i18n/messages/ko.ts` (`세션이 만료되었습니다. 다시 로그인해 주세요.`, `로그인하러 가기`)
- `frontend/src/i18n/messages/en.ts` (`Your session has expired. Please log in again.`, `Go to Login`)
- `frontend/src/i18n/messages/fr.ts` (`Votre session a expiré. Veuillez vous reconnecter.`, `Aller à la connexion`)

9. (추가) 아이디/비밀번호 입력 제한
- `auth-service/src/auth.service.ts` (`emailRegex`, `passwordRegex` 검증)
- 추후에 더 강화된 방식 도입해야함. 앞으로 사용자 입력 받는 부분이 있다면 동일한 수준의 보안 넣어야함. 

10. (추가) 개인정보/이용약관 페이지
- `frontend/src/pages/PrivacyPage.tsx`
- `frontend/src/pages/TermsPage.tsx`
- `frontend/src/components/common/FooterLinks.tsx` (페이지 이동 버튼)
- `frontend/src/App.tsx` (라우팅 등록)

11. (추가) 닉네임 금칙어 적용(노골적인 욕설방지)
- `auth-service/src/utils/nickname-filter.ts` (금칙어 목록/정규화/허용 여부 검사 유틸)
- `auth-service/src/auth.service.ts` (`signUp`에서 `NICKNAME_NOT_ALLOWED` 반환)
- `user-service/src/utils/nickname-filter.ts` (유저서비스용 금칙어 유틸 동일 적용)
- `user-service/src/user.service.ts` (`createUserProfile`, `updateProfile`에서 닉네임 검증)
- `frontend/src/types/i18n.ts` (`errors.NICKNAME_NOT_ALLOWED` 타입 추가)
- `frontend/src/i18n/messages/ko.ts`
- `frontend/src/i18n/messages/en.ts`
- `frontend/src/i18n/messages/fr.ts`

12. (추가) 프론트엔드 라우트가드 (로그인 이후 페이지들)
- `frontend/src/App.tsx` (`/home`, `/social`, `/myspace`를 `ProtectedRoute`로 보호)
- `frontend/src/hooks/useAuthInit.tsx` (`fetchMe()` 결과(boolean) 기반으로 인증 상태 정리)

13. (추가) 의도된 로그아웃/세션만료 분리 + 보호 라우트 진입 시 1회 재검증
- `frontend/src/hooks/Logout.tsx` (`intent_logout` 플래그 저장 후 `/login` 이동: 수동 로그아웃 시 세션만료 경고창 비노출)
- `frontend/src/App.tsx` 
  - `handleUnauthenticated`에서 `intent_logout` 플래그 확인 후 세션만료 경고창 분기
  - 보호 라우트 진입(경로 변경) 시 `fetchMe()` 1회 재검증(`revalidateAuth`) 추가
- `frontend/src/hooks/useAuthInit.tsx` (`fetchMe`를 `useCallback`으로 고정해 가드 재검증 의존성 안정화)

-------------------------------------------

## 오늘 기준 점검 메모(수정/보완)

1. 현재 설계 정리
- 1차 인증 판단: gateway (`ACCESS_TOKEN_REQUIRED` / `ACCESS_TOKEN_INVALID`)
- 재발급 책임: auth-service (`/refresh`, RT 검증/회전/블랙리스트)
- 사용자 유도: frontend (전역 세션만료 경고창 + 로그인 이동)

2. 확인된 제한사항
- `friendService`는 `apiClient`를 거치지 않아 소셜 API의 토큰 예외 처리가 다른 API와 100% 동일하지 않을 수 있음.