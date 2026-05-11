정해야 할 것
1. 채팅 기능 범위 확정 (읽음 처리, 파일 주고받기) 
- 파일은 불필요
- 읽음 처리 불필요
- 온라인 상태인 로그인한 사용자만 친구에게 send
- 친구에게서만 recv가능(받는 상태는 상관 ㄴㄴ)

2. 게스트 히스토리 정책 (보여줄지/숨길지, 보관 기간)
- 체험판 수준 

3. 게스트 -> 회원 전환 시 데이터 승계 범위
- 체험판 수준

TODO 

suna
A: 게스트 모드
- 게스트 관련 작업
1. 프론트: 비로그인/게스트가 제한 기능 버튼 클릭 시 회원가입 안내창 표시
2. 백엔드: 프론트 차단과 별개로 API 권한 검증 필수 (우회 호출 방지) /임시 유저 생성

daeunki2
B: presence(Redis Pub/Sub + gateway push) (백 안에서만 돌거로 예상.. )
1. 상태 정의 및 전파
-  offline / online / in_game + matching(외부에서는 online으로 보임)
2. 상태 기반 변경 제한
- 예: matching/in_game 중 닉네임 변경 불가, 친구추가 불가
- online || in_game || matcing인 유저가 로그인 시도시 막기.
- 추가적으로 하다가 필요하다 싶으면 해야할거 같아요...
3. 사용범위 
- 디비에 들어가야 하는 정보(게임 > 유저)들은 rest방식으로 안전하게 주고 받기. (많이 왔다갔다 안 할거 같음)
- 이벤트 상태 
- 30초는 길다... 웹소켓 연결기준으로 끊어지면 에러창을 보여주든지 

chanypar
C: chat-service MVP (소켓은 클라이언트랑 주고 받을예정)
1. DM 기준 메시지 송수신 + 저장
2. 송신 조건 명확화
- 송신자: 로그인 사용자만 가능
- 수신자: 오프라인이어도 수송 가능 (DB 저장?)
- 수신자가 온라인이면 실시간 푸시, 오프라인이면 이후 조회 시 노출


suna
D: 가드달기
1. 서비스가 안돌아가는 상황에서의 가드 만들기 
- 프론트 : 예상치 못한 문제 발생 > 나가게(로그아웃)
- 백 : 진입전에 서비스가 돌아가는지 확인을 하고 아니면 에러를 반환 > 프론트에서 에러 받아서 안내창 출력
에러가 발생했을때 
ex : 유저서비스 ㄴㄴ 하지만 게임은 가능하게. 한 서비스 불가해도 다른 서비스가능하게. 
인증이 죽으면 > 게스트 게임만
채팅죽으면 > 게임만
유저죽으면 > 채팅은 아마도 못 하겟죠...

2. 404 요런 페이지 만들어 두기.


다 같이
게임 각 보기...
1. 연결(매칭)
2. 로직
3. ai달기
.....


----------------------------------------

이번주 금요일은 상태만 카톡으로 나 nn했다 더 할거 있냐 도와달라.
(일단 수요일 ㄴㄴ)
다음 회의 일정 잡고 > 
게임일감 나누고 > 
게임 진행

======================================

game service 구현

frontend
- 대기 모달 추가 (/home 고정)
- socket 연결구현
- asset생성(공, 패들, 게임 배경(2가지 태마, 점수판, 사운드?))
- 초기값랜더 생성, requestAnimationFrame로 주기적으로 랜더링
- 서버에서 업데이트 된 패들, 공 수신 후, latestState에 변수형태로 저장(자동으로 랜더링)
- game over수신 시, 결과 각 사용자에게 알림, 리스너 해제, 소캣종료

backend
1. initial 작업 
- game.gateway 생성
	- presence redis 구독 in game 이벤트 발행
- db생성
- game redis생성
	- 대기열: list(userId)
	- 게임셰션:
		유저 상태(대기, 메칭, 게임 중, 게임 끝)
		유저(유저1, 유저2)
		필드(패들위치, 공위치, 게임점수)
		시간
2. 메치메이킹
- 1번쨰 유저가 게임 눌렀을 시, game redis 대기열 list 추가 로직
- 2번째 유저가 게임 눌렀을 시, game redis 대기열 list 추가
- 대기열에 2명 이상 있을 시 queue로 불러와서 gameId생성 후 게임 세션 생성, 방 생성(대기열에서 소캣 연결 튕겼을 때 대처 로직 필요)
- 이벤트로 프론트에 각각의 플레이어'match_found'위치 전송
3.게임 실행 시
- 패들 움직임 : 이벤트 발생('move paddle': up, down) 서버전송 -> 게임셰션 변수만 수정
- 공 움직임 : 게임셰선 공위치 변수 수정(간단한 예. 가로벽을 만나면 y축 반전, 새로벽을 만나면 x축 반전)
-> 두개 다 같은 interval에서 동시에 업데이트 실행 (단일 쓰기 작업(redis)), 그후, emit('game_state') 프론트 전송
- 게임 도중 유져 disconnect 감지(presence redis), interval 정지, 종료단계로 감
4.종료
- interval 멈춤
- emit('game over') 프론트 알림
- redis 값 game db 전송(메치히스토리)
- game end 이벤트 발행
- redis 정보 삭제

5.AI 매칭

맞춰야할 사항
- 서버 <-> 프론트 데이터 규격 (예: { ballX, ballY, p1Y, p2Y, score1, score2 })
- 캔버스 사이즈 (1000x800)
- 이벤트 명 통일

client -> server
game:join_queue(게임 대기열에 등록)
game:ready(매칭 후 게임 화면 준비 완료)
game:move_paddle (패들 움직임)

server -> client
game:match_found (매칭 성공, 게임룸 생성)
game:state (interval 마다 공위치, 패들위치, 스코어 전송)
game:over (게임 끝 최종 스코어 전송)

server -> presence redis
game:started(in game 변경)
game:ended(online 변경)

생각해야할 것
- 대기열에 너무 오래 대기 시, 나가게. 혹은 대기 취소 기능 추가
- 대기열에서 소캣 튕겼을 때 로직 필요

presence redis : connect, disconnet, maching, in game

분할 :
- 백 게임 메칭: 유저 메칭부터 게임 방 생성 + presence redis connected -> maching (소캣 연결, redis, game db) - 승빈님
- 백 게임 로직: 게임 시작 부터 끝난 후 데이터 전송까지 + presence redis maching -> in game -> connected (공 위치 알고리즘 game state 전송) - 다은님
- 프론트(게임 관련 + 유저 히스토리(상대방 아이디, 점수(나, 상대): 최신 5개 정도) http -> game controller) - 찬영님