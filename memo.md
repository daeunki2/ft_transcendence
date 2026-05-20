## 현재 merge 상황

- 현재 브랜치: study
- study는 origin/main 상태로 reset 완료
- 그 위에 origin/daeunki2를 merge하다가 충돌 발생

## ame-service/src/game.gateway.ts
- suna로직 100반영
+ daeunki2의 게임 관련 부분은 파일을 새로 파서 이사. (기존 로직은 땜빵용이라 폐기)

## game-service/src/app.module.ts
 suna 에서 유지:
- RedisModule
- MatchmakingModule

daeunki2에서 추가:
- GameEngineService
- GameRecordEntity
- GameHistoryService
- GameHistoryController
- TypeOrmModule.forFeature([GameRecordEntity])
- TypeOrm entities에 GameRecordEntity 등록

## frontend/src/hooks/useGame.tsx

- suna의 매칭/에러 상태 처리를 유지하고 daeunki2의 게임 결과 처리만 추가

## frontend/src/pages/HomePage.tsx
## frontend/src/types/i18n.ts
## frontend/src/i18n/messages/en.ts, ko.ts
- 단순 suna + daeunki2

