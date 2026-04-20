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