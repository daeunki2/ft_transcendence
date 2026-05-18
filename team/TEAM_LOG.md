# TEAM LOG
앞으로 본인의 작업 내용과 관련하여 추적이 쉽도록 여기에 기록하면 좋을것 같습니다.
커밋메세지는 핵심만 간단히 남기고 여기에 내용 잘 작성해 주세요.
---

## [2026-03-21] daeunki2

branch : study
Commit: front/team add

### what 
- PDF 파일에 하이라이트 추가(우리가 선택한 모듈)
- 프론트 컴포넌트 생성
{
	0. 기본적으로 테마와 언어를 고려하여 설계함
	1. 페이지에서 반복적으로 사용되는 넓은 영역은 common에 저장
	2. 일종의 부품인 스위치나 카드는 ui에 저장 
}
- 페이지 생성
{
	0. 기본적으로 테마와 언어를 고려하여 설계함
	1. 랜딩 - 테마, 언어변경 가능
	2. 로그인 - 테마 언어변경 가능
	3. 회원가입 - 테마 언어변경 가능
	4. 이용약관 - ㅛ내용 추후에 추가
	5. 개인정보처리방침 - 내용 추후에 추가 필요
	6. 홈페이지 - 테마 언어변경 가능
}

### 왜
- 로그인 기능을 구현하기 전에 가장 기본적인 골격구조 완성

### 안내
- 앞으로 우리 프론트는 하드코딩을 하지 않는 방향으로 가야 모두가 편할거 같음.
- 테마에 맞는 색상들을 미리 지정하여 직접 하드코딩하는 일이 없도록 조치. 색상 추가 가능, 변경 가능.
- 언어 또한 하드코딩하지 않도록 각 언어 파일에 넣어두고 사용하도록 조치 문구 변경 가능. 

- 하드코딩 금지!
- 페이지 만들때 미리 어디에 뭐 둘지, 문구들 다 생각하고 작업하면 편함.

### to do
- 지금 아무런 기능 없이 클릭하면 넘어가게만 해두었음. 추후에 필요한 api정해야 함
- 지금은 간단한 함수도 없음 추가해야함.

### 보는법
- study 브랜치에서 프론트엔드 디렉토리로 이동
- npm run dev 입력
- 혹시 안 보인다면 nvm use 20으로 버전 동기화 해야함
- 크롬에 주소 입력
- 탐색


## [2026-03-27] daeunki2

branch : main
Commit: restructuring

### what 
- meeting 디렉토리 생성. 모듈표 회의록 업데이트. 키노트는 수정이 번거로워 텍스트로도 작성
- daeunki2 디렉토리 생성. 공부한것 여기 올릴 예정

### ps
- 앞으로 작업이 많아질 경우를 대비해서 중요한 커밋의 경우 이렇게 로그를 남기면 좋을 것 같습니다.
- 어떤 파일에서 무슨 작업을 했는지, 혹시 건들면 안돼는 파일이 있는지 정도만 있어도 좋지 않을까... 싶습니다. 

### .env

- root(compose 파일 있는 곳)에 하나 /backend에 하나 총 2개 만들어야함

ft_transcendence/.env

```
AUTHDB_USER=user
AUTHDB_PASSWORD=password
```

backend/.env

```
MY_SECRET_KEY=1234
```

## [2026-04-04] chanypar

brunch: main

![photo1](./로그인%20및%20getme()%20흐름.png)
-> 참고용

### what
- 기존에 페이지 내에 존제하던 로그인, 가입 기능을 /hooks 로 빼고 로그아웃, getme함수 (후술할 예정)와 같이 페이지 버튼에서 바로 함수 실행하게 놨습니다. logout은 컴포넌트 자체에 함수를 추가 했습니다.
- 로그인, 가입 시 서버 값 기다릴때 각 언어별로 '로그인 중', '가입 중'표시
- 로그아웃 시 서버에서 쿠기 내에 토큰 삭제
- Context API를 위한 /contexts 생성

###  Cookie + Context API 
- 기존방식 : 페이지를 이동하거나, 새로고침시 유저 데이터가 필요하면 매번 서버에 호출
- 수정방식 : 로그인 후 유저가 /home에 들어왔을 때 getme() 호출, 닉네임, 유저 아이디, 이메일 전역 변수형태로 저장. 페이지 이동시에서 위 정보 프론트에서 사용 (새로고침하면 그래도 사라집니다)

==> 쿠기 내에 토큰 그대로 인증으로 사용, Context API는 그져 프론트 용. 페이지 바뀔때마다 쿠키의 토큰 확인은 동일

#### 원리
- /home에서 useAuthInit() 호출 -> getme() -> ... (login, logout 흐름이랑 동일)... -> 서버에서 쿠키를 읽고 사용자 데이터 반환 -> contexts/AuthContext.tsx 내에 provider (전역 상태를 내려주는 공급자 역할 컴포넌트)에 저장

- main.tsx 구조 참고하시면 이해하기에 좋습니다
- 서버 사용자 데이터 읽을 때 cookie parser 필요 (/backend에서 하세요)

```
npm install cookie-parser
npm install -D @types/cookie-parser
```

### 나중에 추가할 내용
- 새로고침 할 시 자동으로 getme()호출이 되는가? (확인필요)
- 어떤 정보 들고올지 정하기 (지금은 아이디, 닉네임, 이메일)
- 로그아웃 시 provider 내에 정보가 사라지는가? (확인 필요)
- 쿠키에 현재 토큰만 넣어놨는데 다른 정보 넣어놓을 지
- providers에 microservice 대응 시 getme를 처리하는 방식, API 게이트웨이에서 각 서비스별로 분할 (공부 및 구현필요)

![photo2222](./마이크로%20서비스%20게이트%20웨이.png)


## [2026-04-05] daeunki2

commit -m "feat: add custom Alert component for registration flow"

### what
1. 경고창 컴포넌트 추가 (사실상 상태알림창으로 활용즁)
2. 백의 로그아웃/회원가입 부분에서 메세지가 아닌 코드를 보내도록 수정
3. 프론트는 코드를 활용하여 다국어 메세지를 표시하도록 수정
4. 커스텀 경고창을 활용하도록 수정

### 같이 생각해 보면 좋을 내용
- 혹시 닉네임 중복 허용하는지? (채팅상대나 매칭할때 닉네임으로 상대 찾게 하려면 중복 막아야함)
- 기본적인 검증 필요하지는 않은지? (비밀번호 n자이상 이메일 형식 등등.)
- 사실상 우리는 아이디가 이메일일 필요가 없는거 같은데 혹시 그냥 아이디로 하게 하는건 어떤지?

## [2026-04-05] chanypar

commit -m gateway_microservice_start

### what
- 서버 분할을 위한 gateway 생성
- microservice 위해 각각의 서비스 디렉토리 생성 및 backend/ 이름변경 (auth-service, user-service)
- docker-compose.yml 수정 : user-service 추가, user-database 추가
- 기존의 db -> auth-database로 수정
- .env 파일 수정 :

ft_transcendence/.env

```
AUTHDB_USER=user
AUTHDB_PASSWORD=password

USERDB_USER=user
USERDB_PASSWORD=password

```

auth-service/.env (파일 수정은 안했지만 햇갈리실까봐 넣어둡니다)

```

MY_SECRET_KEY=1234

```

- user-service 개발 시, user-service/src/entities/user.entity.ts 에서 테이블 추가 및 수정 가능합니다
- 함수 추가하실 때는, 프론트엔드에 service/ 디렉토리 참고해 주세요


## [2026-04-10] chanypar

commit -m update_profile_nick

### what
- register 시 auth-service/src/auth.service signUp 함수에서 user-service/src/user.controller 의 init 함수 호출 (this.httpService.post('http://user-service:4001/init'...))
- ->  즉, 가입시 auth-db의 테이블을 채우고, gateway거치지 않고, 바로 user-service의 init 함수로 사용자 정보를 보내 user-db 테이블 채움
- getme() user-service로 이동, 새로고침하거나, 로그인 후 실행 :
- -> 로그인 시 -> hooks/login  ```await fetchMe();```
- -> 새로고침 시 -> App.tsx   ```useEffect(() => { fetchMe(); }, []); ```
- src/pages/MySpacePage 사진, 닉네임 수정하도록 설정
- -> user-service에 updateProfile 함수 추가 (닉네임, 사진 둘다 대응가능), 수정 시 자동으로 프로필 업데이트 

### 각 서비스 db 테이블 구성
- auth-db : [auth] uuid, email, pass, created_at
			[token] refresh_token
- user-db : [users] uuid, email, nickname, created_at, userPhoto
			[friends] 성빈님 추가예정

### 생각해볼 내용
- getme() 함수는 자동으로 새로고침이나 브라우저에 진입할 때 실헹되기 때문에, 처음에 랜딩페이지 들어왔을 떄도, 실행이 되고, 당연히 유저가 등록되기 전이기 때문에 404에러를 서버에서 반환. 알아본결과 실무에서도 큰 에러가 아니기에 그냥 냅둔다고 함. 하지만 정 수정 원하면 서버차원에서 에러 반환하지 않도록 수정가능함.


## [2026-04-12] suna

Commit: friend feature

### what

   - `friends` 테이블(entity) 생성 : requesterId, addresseeId, status(pending/accepted) 구조
	db 통해 조회, 수락/거절, 요청 흐름.	

   - 닉네임 조회 및 id 조회를 위해 user 테이블 참조 필요.

   - FriendsModule, FriendsController, FriendsService 생성

   - 양방향 중복 체크, 본인 추가 방지, 권한 검증 등 예외 처리

   - 에러 코드 방식으로 프론트에 반환 (USER_NOT_FOUND, CANNOT_ADD_SELF, ALREADY_FRIENDS_OR_REQUESTED 등)

   - user-db : [friends] id, requesterId, addresseeId, status, createdAt, updatedAt

### API 엔드포인트 (gateway 경유: /api/users/friends/...)
- `GET /friends` — 내 친구 목록
- `GET /friends/requests` — 받은 요청 목록
- `POST /friends/requests` — 친구 요청 보내기 (body: { nickname })
- `PATCH /friends/requests/:id` — 요청 수락
- `DELETE /friends/requests/:id` — 요청 거절
- `DELETE /friends/:id` — 친구 삭제

### 생각해볼 내용
- 현재 인증은 임시로 `x-user-id` 헤더 사용 중. JWT 인증 도입 시 `req.user.id`로 전환 필요



## [2026-04-12] suna

Commit: changing uid type to string

### what

   - frined 기능 내의 코드에서 uid를 number로 받아 타입 불일치 버그 발생
   - 따라서 string으로 바꾸어 타입 불일치 해결
   - 그 외 모든 friend 관련 코드 number -> string으로 수정


## [2026-04-15] daeunki2

Commit : token + gateway

### what
- 토큰 발급 재발급 블랙리스트 
- 게이트웨이 인증
- 재로그인 처리 + 프론트 가드
- 간단한 보안처리 + 금지어
- 개인정보 + 이용 약관 

### 생각해볼 내용
- 생각보다 내용이 많아서 team/daeunki2/token_gateway_work_log에 기록 남겼습니다.
- 0410 suna에 남겨진 "JWT 인증 도입 시 `req.user.id`로 전환 필요" 필요성에 동감합니다. 

### ps 
- 지금 여기저기 한글로 로그 박아둔 상태입니다. 일단 개발상태에서는 유지 혹은 축소하고 나중에 정리하겠습니다.


## [2026-04-16] daeunki2

Commit : readme.md update

### what
- readme 목차 정리

## [2026-04-16] suna

Commit: friend, type, apiclient

### what

   - social page에서 userPhoto: number; 데이터 까지 참조하여 친구 아바타 그림 조회가능하게 수정
   - friend controller에서 객체, 배열로 반환하는것을 객체 반환으로 통일. 친구 조회, 요청 조회는 모든 친구/요청들 id를 배열에 담아서 반환 그러나
요청 수락, 친구 삭제와 같이 단일 요청 처리는 객체로 반환하여 반환 통일성이 없었음. 따라서 모든 friend controller에서 반환값을 객체로 반환.
   - api호출을 friendservice자체적으로 호출하던것을 apiclient로 호출하도록 수정.
   - 또한 DELETE API는 BODY가 없어 {} 빈 body를 apiclient호출 부에 추가(await apiClient('delete', `api/users/friends/${friendId}`, {});)
   - Get에서는 axios 자체적으로 body를 수정해서 에러가 발생하지 않음.

   ### 생각해볼 내용
	- 친구 추가 입력창에 아무것도 입력하지 않고 add버튼을 누르면 apiclient를 호출하기 전에 자체적으로 닉네임을 입력하라는 에러가 반환됨.
	따라서 엑세스 토큰이 재발급되지 않고 있음. 그러나 새로고침, 입력창에 닉네임 입력하고 add하면 재발급 및 재실행이 됨. 이것을 수정해야할지 유지 할지 고민 중.

## [2026-04-20] daeunki2

Commit: QA frontend fix

### what
fix
- qa중 발견한 문구들 수정했습니다.
- 개인정보이용, 이용약관 페이지에서 밑에 텍스트 버튼 보이던 부분 제거
update
- email이 아닌 id를 사용하게 했습니다.
- 로그인 회원가입 할때 빈칸이면 프론트에서 값 채워달라고 문구 나오게 해뒀습니다.

### 생각해볼 내용
- 아바타 사진 업로드 가능하게 해야할거 같아요
- 온라인 상태 표시 가능하게 해야할거 같아요
- role 어떻게 정의하고 구현할지 정해야 합니다. 

 ## [2026-04-21] suna

Commit: friend online status, request success feedback

### what

   - social page에서 `isOnline?: boolean`로 서버로부터 온라인 상태 변수값 받을 수 있도록 수정
   - 친구 아바타에 온라인/오프라인 상태 표시용 점
   - `SocialPage`에 `successMessage` state 추가, 요청 성공 직후 Alert 오픈 → 닫으면 null로 초기화,친구 요청 성공 시 성공 Alert 컴포넌트로 "친구 요청을 보냈습니다."

 ## [2026-04-22] suna

Commit: docker health check, package-lock in user-service

### what

   - docker compose에 컨테이너 시작 순서 설정
   - auth-db, user-db,redis 먼저 시작, 그 다음 auth-service,user-service컨테이너 시작, gateway 마지막, frontend는 의존성 없이 독립적으로 시작
   - user-service에만 package-lock이 없어 package.json의 버전이 유저에 따라 다르게 설치될 수 있어, lock 파일 생성.
   
   

 ## [2026-04-24] chanypar

 Commit: myspace_upload_avatar

### what
 - 아바타 파일 업로드 추가 MySpacePage.tsx 에서 아바타 모달 완전히 제거 (일단 SocialPage에서 아바타 모달을 참조하고 있기에 삭제는 아직 안함. friend-service 수정 후 삭제)
 - user-service entity에 userPhoto : number에서 string으로 수정
 - userPhoto에 user-service/uploads안에 사진주소 링크 (ex: http://localhost:4001/uploads/default.jpg), 로컬 스토리지에 저장
 - 처음생성시, default 사진 들어가 있음
 - 파일 크기는 5MB로 제한, 형식은 jpg,jpeg,png,gif로 제한. 서버부하를 막기 위해 파일 크기는 프론트에서도 확인.
 - 에러 메시지 추가

 - 흐름도: `MySpacePage.tsx(uploadPhoto) -> useUploadPhoto.tsx(apiClient 호출로 백 연결) -> user.controller.ts(@Post('uploadPhoto')로 받은 뒤, 형식 및 크기 확인) -> user-service.ts(handleFileUpload에서 파일 접근 url생성 후 유저 디비 업데이트 위해 updateProfile호출) `

 ### 추가 및 알게된 내용

 - apiClient에 formData전송로직 추가 (파일 전송은 JSON형식이 아니라 FormData형식으로 하는 게 효율적)
 - user-service 내에서 formData형식을 읽기 위한 Multer 추가 (바이너리 데이터를 읽게 함)

  ## [2026-04-25] suna

Commit: changing userphoto type

### what

   - userPhoto 타입을 number -> strin정정
   - <Avatar url={AVATAR_MAP[friend.userPhoto]} /> 방식에서 매핑이 사라지고 url 받은 값 그대로 <Avatar url={friend.userPhoto} /> 프론트에서 수정

   ## [2026-04-29] suna

Commit: status page

### what

   - health와 health\ready 엔드 포인트 생성
   - health는 단순히 라우터, http 작동 잘되는지, health\ready는 그와 관련된 의존성까지 잘 작동하는지(db, redis) 확인
   - uptime kuma라이브러리로 상태 페이지, localhost:3001에 할당
   - uptime kuma에서 직접 각  서비스 http 엔드 포인트 health, health\ready url을 설정하면 검사 시작.
   - docker build한 바로 직후 uptime kuma에서 아무 이유 없이 빨간불 들어오면서 오프라인이 된다면 재시도 횟수를 늘려 줘야 함. 빌드 될 때 상대적으로 느리게 빌드 되는 서비스를 kuma는 1번 시도 후 오프라인으로 인식 
### 생각해볼 내용
   - 현재 상태페이지는 호스트 서버에만 열람 가능, 이걸 공개적으로 열람 가능하도록 설정해야할지 고민
   - 공개적으로 열람한면 보안상 조치 취해야 함.

   ## [2026-05-08] suna

Commit: guest + guard

### what

   - service health guard에서는 frontend/src/services/serviceHealthStore.ts에서 서비스 상태 전역 변수로 저장.
   - frontend/src/contexts/ServiceHealthContext.tsx에서 provider가 변수 상태를 관찰
   - provider에서 상태 값 변화시 알림, 이 알림을 받고 싶은 react 컴포넌트는 const { health } = useServiceHealth();로 상태 변화 감지
   - apiclient는 react컴포넌트가 아닌 우리가 만든 자체적인 함수. 따라서 import { isUserServiceDown, markServiceDown } from './serviceHealthStore'; 와 같은 별개의 함수를 import하는 방식으로 상태 감지
   - 게스트 역시 전역 변수에 isguest상태값과 db에 role에 표시.
   - isguest 사용처는 가드, db role의 사용처는 db에서 게스트 데이터 값 지울 때 일반 유저와의 구별
### 앞으로 할것
   - 친구 페이지 새로고침 수정

## [2026-05-08] chanypar

Commit: chat-service

### what
- chat service 흐름도

### chat history + 상대방 상태 불러오기(http)
- loadHistory(체팅 내역 불러오기)
- fetchInitialStatus(상대방 상태 불러오기)

### 소캣 연결 (핸드셰이크 → 승인)
useChat(frontend) → gateway → chat.gateway(chat service)
useChat(프론트에서 소캣 핸드셰이크 후 연결)
chat.gateway(handleConnection)
- onModuleInit(presence redis 구독 설정)
- handleconection(해더검사 → 소캣아이디 저장 → 소캣연결되어 있는 아이디 있을 시 redis 구독 시작 )

### 메시지 발송 & 수신
useChat → chat.gateway(’send_dm’)
useChat(서버가 받는 데이터 형식으로 전송)
chat.gateway(’send_dm’)
- 들어온 데이터 확인 후, processMessage에서 저장
- getUserSocketId에서 유저 실시간 조회
- 실시간이면 바로 전송(’new_dm’), 아니면 유저가 접속할때 (loadHistory) 받음
useChat(실시간 메시지 수신)
- 현제 체팅창이 올바른 체팅창인지 확인 (senderId , TargetId)
- 체팅창 리스트 끝에 추가

### 소캣 종료
chat.gateway
- chat redis socketId삭제
- 만약 소캣 연결한 사람이 아무도 없을시 presence redis 구독종료
useChat(’disconnect’)
- 이벤트 리스너 제거
- 물리적으로 연결제거
- 참조 NULL

### 저장구조
chat db
- id : 프론트에선 임시 아이디(리액트 렌더링 용, 나중에 전송완료 시 진짜 아이디로 업데이트)
- senderId
- receiverId
- content(DTO형식)
    - to
    - message
- createdAt

chat redis
- id
- socketId

## [2026-05-09] daeunki2

Commit: presence + small refactor

### 해야하는 일
현재 상태 표기 + 가드 정리

### 한 일
로그인 인증 상태를 기준으로 presence 소켓이 연결되도록 훅 연동
게이트웨이(presence)에서 이벤트 수집/정규화/저장/전파 흐름 구성
프론트에서 상태 기반 가드 로직 보강 (로그인, 친구 관련 액션)

### 수정한 것
presence 소켓의 시작/종료 처리(재시도 제한, 리스너 정리, 연결 해제, 참조 정리)를 채팅 소켓 수준으로 강화
채팅 서비스가 상태 이벤트를 직접 구독/중계하던 구조에서, 상태 전파 책임을 presence로 집중하고 채팅은 상태 값 소비 중심으로 정리
장애 수정 목적이라기보다 책임/역할 분리를 위한 구조 개선이며, 필요 시 롤백 가능


### 다른 사람의 코드 수정한 부분
- suna (email > id관련 수정)
- user.entity.ts: email이 아닌 id사용하도록
- user.service.ts    loginId: loginId,  loginId: string | null등 id기반으로 수정 
- user.controller.ts data.email이 아닌 id로

- chanypar(상태표시 관련하여 상태를 직접 받는게 아니라 presence만 상태변경 관련 업데이트 하고 그거 받아서 사용하게만)
- useChat.tsx: 채팅은 상태를 직접 관리하지 않고 표시만 하도록 프론트 로직 정리
- 기존 상태 조회/구독 직접 처리 부분은 주석 처리
- 상태변경은 받아서 사용하게 usePresenceStatus.tsx안에 함수를 넣어두었고 그 함수를 콜해서 상태 받게 함.
- usePresenceStatus의 경우 백에서 상태변화를 emit받으면 재랜더링 해주기 때문에 실시간으로 상태 표기 가능함.
- 이 부분은 혹시 롤백해야 하는 경우 롤백해도 괜찮습니다.

### 간단한 설명

상태 변화는 다양한 서비스에서 발생할 수 있습니다. 
이 변화들은 이벤트 발행/구독(pub/sub)으로 전달되고, gateway presence가 이를 받아 최신 상태로 정규화합니다.
정규화된 상태 이벤트는 다시 프론트로 전달됩니다.

동작 흐름:

1. 게이트웨이/ 게임서비스가 상태 이벤트를 Redis 채널에 publish (이벤트 발생시 보내기)
2. gateway presence socket이 Redis 채널을 subscribe (보낸 이벤트들을 받기)
3. 최신 상태로 정규화 
4. 구독한 이벤트를 클라이언트로 presence.updated emit (최신상태에 변화가 있을때만 프론트로 전송)
5. 프론트는 이를 받아 store에 반영 (한 곳에 박아두고 사용하게, 상태변화가 있으면 재랜더 하게)
6. 필요하면 저장된 값을 받아서 사용 

기존 채팅 서비스는 상태 이벤트를 직접 구독/중계하는 방식이었습니다.
이 때문에 presence 소켓 경로와 chat 소켓 경로가 동시에 존재해, 같은 상태를 2곳에서 받는 구조였습니다.
치명적 장애를 만든 구조는 아니었지만, 각 소켓의 책임을 명확히 하기 위해 분리했습니다.

## [2026-05-11] chanypar

Commit: Game-service_front

### what
- 프론트 game service 소캣 생성(hooks/useGame.tsx)
- joinQueue 함수(대기열 추가 함수), movePaddle(패들 이동함수) 기본만 생성
- HomPage에 버튼에 useGame 연결

- 게임 버튼 눌렀을 시, 취소가능? 고려해야할 사항  

## [2026-05-18] chanypar

Commit: Game-ai

### what
- 게임디비에 저장할때 저장했는지 아닌지 확인해서 1번만 저장하게 수정
- ai가 단순 y축만 따라가는게 아니라 위치를 예측해서 가게함 (지금 꽤 강해서, 수치 조정 해야함)
- 대기중인 상태에서 나갈때 상태변화 하도록 함
- ai인 경우 닉네임을 AI_BOT으로 저장 + AI_BOT을 금칙어로 지정하여 유저는 닉네임으로 못 쓰게함