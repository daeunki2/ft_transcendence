
---

## 1. API와 REST API

### API란?
내부 구현을 몰라도 정해진 방식으로 요청하면 결과를 돌려주는 **약속된 창구**.

### 전체 흐름
```
① 백엔드 라우터에 URL 등록 (HTTP Method + Path 세트로 등록)
② 프론트가 그 URL로 HTTP 요청 (어떤 데이터를, 어떻게 쓸지)
③ 라우터가 받아서 JSON으로 응답
```

### 코드 예시

**① 백엔드 — 규칙 등록**
```js
router.get('/users/:id', async (req, res) => {
  const user = await DB.find(req.params.id)
  res.json({ data: user })
})
// 등록되지 않은 Method + URL 조합은 405 에러 반환
```

**② 프론트 — 요청**
```js
const res = await fetch('/api/users/42') // method 생략 시 기본값 GET
const { data } = await res.json()        // JSON으로 응답 받음
```

---

## 2. REST API 설계 규칙

업계 표준 API 설계 규칙. 강제는 아니지만 사실상 표준.

| 규칙 | 설명 | 예시 |
|------|------|------|
| URL은 명사 | 동사 금지, 리소스를 명사로 표현 | `/users/1` (O) `/getUser` (X) |
| HTTP Method로 행동 구분 | GET/POST/PUT/PATCH/DELETE | `GET /users` → 조회 |
| 응답은 JSON | 상태코드 + JSON 바디 | `200 OK + { id:1, name:'Kim' }` |
| Stateless | 서버가 클라이언트 상태 저장 안 함 | 세션 대신 JWT 사용 |

---

## 3. URL 구조

```
https://api.example.com:443/api/v1/users/1?role=admin
   │          │            │       │         │
Protocol    Host          Port   Path      Query
```

| 구성요소 | 예시 | 설정 주체 |
|---------|------|----------|
| Protocol | `https://` | 인프라 |
| Host | `api.example.com` | DNS 설정 |
| Port | `:443` | 서버 실행 시 |
| Path | `/api/v1/users/1` | **백엔드** (라우터에 등록) |
| Query | `?role=admin` | **프론트** (요청 시 동적으로 첨부) |

### Query 사용 예시

같은 Path에서 조건만 다르게:
```
GET /users                               → 전체
GET /users?role=admin                    → admin만
GET /users?page=2                        → 2페이지
GET /users?search=Kim                    → Kim 검색
GET /users?role=admin&page=2&search=Kim  → 전부 조합
```

**백엔드에서 Query 처리:**
```js
router.get('/users', async (req, res) => {
  const { role, page = 1, search } = req.query  // URL 쿼리 꺼냄

  let query = 'SELECT * FROM users WHERE 1=1'   // 기본 DB 쿼리

  if (role)   query += ` AND role = '${role}'`
  if (search) query += ` AND name LIKE '%${search}%'`
  query += ` LIMIT 10 OFFSET ${(page - 1) * 10}`  // 프론트에서 설정한 쿼리문을 db쿼리에 추가

  const users = await DB.query(query)
  res.json({ data: users })
})
```

> **URL 쿼리 vs DB 쿼리**: 이름이 같지만 다른 개념.
> URL 쿼리(`?role=admin`) → 백엔드가 꺼내서 → DB 쿼리(`WHERE role='admin'`)로 변환.

---

## 4. HTTP 구조

### Request
```
Method  : GET / POST / PUT / PATCH / DELETE
URL     : 어떤 리소스인지
Header  : 인증 토큰, Content-Type 등 메타 정보
Body    : 보낼 실질 데이터 (JSON 형식, GET/DELETE는 없음)
>PUT vs PATCH: PUT은 리소스 전체를 교체 (보내지 않은 필드는 null). PATCH는 보낸 필드만 수정, 나머지 유지.
```

### Response 상태코드

| 코드 | 의미 | 언제 |
|------|------|------|
| 200 OK | 성공 | GET, PATCH, PUT |
| 201 Created | 생성 성공 | POST |
| 204 No Content | 성공 (바디 없음) | DELETE |
| 400 Bad Request | 요청 형식 오류 | 필드 누락, 타입 오류 |
| 401 Unauthorized | 인증 안 됨 | 토큰 없음/만료 |
| 403 Forbidden | 권한 없음 | 남의 데이터 접근 |
| 404 Not Found | 리소스 없음 | 없는 id 조회 |
| 409 Conflict | 충돌 | 이메일 중복 가입 |
| 500 Internal Error | 서버 버그 | 예상치 못한 에러 |

---

## 5. 마이크로서비스 아키텍처

### 모놀리식 (기존 방식)
하나의 서버 안에 모든 기능을 다 넣음.

> **42 Inception 예시**: Nginx가 사용자 관리, 게시물 관리, 댓글 관리 등 모든 로직을 혼자 감당.

### 마이크로서비스
기능별로 독립된 서비스로 분리. 서비스 간 REST API로 통신.

> **42 Inception 예시**: 사용자, 게시물, 댓글, 미디어를 각각 독립 서비스로 분리했어야 함 (Single Responsibility). 각 서비스는 REST API로 통신.

| 비교 | 모놀리식 | 마이크로서비스 |
|------|---------|--------------|
| 배포 | 전체 재배포 | 서비스 단위 독립 배포 |
| 장애 | 하나 죽으면 전체 다운 | 해당 서비스만 영향 |
| 확장 | 서버 전체 증설 | 트래픽 많은 서비스만 증설 |
| 팀 | 코드베이스 공유 | 팀별 서비스 독립 담당 |

![alt text](<스크린샷 2026-03-19 230144.png>)

---

## 6. JWT 인증

### 왜 JWT인가?
마이크로서비스는 여러 서버의 집합 → 유저 정보를 서버 메모리에 저장하는 방식 불가능 (모든 서버에 동기화해야 함).

대신 **최초 로그인 시 JWT 토큰을 발급**해 클라이언트가 쿠키에 보관. 이후 모든 요청에 토큰을 첨부 → 서버는 서명 검증만으로 인증 완료 (매 요청마다 DB 조회 없음).

### 세션 vs JWT

| | 세션 | JWT |
|---|------|-----|
| 서버 메모리 | 상태 저장 | 저장 안 함 |
| 매 요청마다 | DB 조회 | 서명 검증만 |
| 서버 재시작 | 로그아웃됨 | 토큰 유지 |
| 마이크로서비스 | 서버 간 동기화 필요 | 토큰 하나로 모든 서비스 통과 |

### 흐름
```
① 로그인 → DB 조회 1번 → JWT 발급
② 이후 모든 요청 → 토큰 첨부 → 서명 검증만 (DB 조회 없음)
```

---

## 7.  CRUD
Create, Read, Update, Delete의 앞글자로, 어떤 데이터든 CRUD로 관리한다는 개.

| CRUD | HTTP Method | URL 예시 | 성공 응답코드 | SQL |
|------|------------|---------|------------|-----|
| Create (생성) | POST | `POST /users` | 201 Created | `INSERT INTO` |
| Read (조회 전체) | GET | `GET /users` | 200 OK | `SELECT *` |
| Read (조회 1건) | GET | `GET /users/1` | 200 OK | `SELECT WHERE id=1` |
| Update 전체교체 | PUT | `PUT /users/1` | 200 OK | `UPDATE SET` 전체 |
| Update 일부수정 | PATCH | `PATCH /users/1` | 200 OK | `UPDATE SET` 일부 |
| Delete (삭제) | DELETE | `DELETE /users/1` | 204 No Content | `DELETE WHERE` |



### 유저(User)를 CRUD하는 실제 예시

```
C — 회원가입 (유저 생성)
POST /users
body: { name: "Kim", email: "k@k.com", password: "1234" }

R — 프로필 조회
GET /users/42

R — 유저 목록 (관리자)
GET /users?role=admin&page=1

U — 프로필 수정 (이름만 변경)
PATCH /users/42
body: { name: "Park" }

D — 회원 탈퇴
DELETE /users/42
```

실생활로 보면 우리가 앱에서 하는 **회원가입, 프로필 보기, 정보 수정, 탈퇴** 이 네 가지가 그대로 CRUD다.

