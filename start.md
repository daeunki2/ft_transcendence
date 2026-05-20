# 프로젝트 원격 실행 준비

## 1. 접속 주소 변경

VSCode에서 `replace name`으로 전체 검색한 뒤, 아래줄에서 본인의 자리 주소 또는 실제 접속 주소로 변경한다.

- `gateway/.env`
- `chat-service/.env
- `game-service/.env`
```env
FRONTEND_ORIGIN=https://localhost:5173,https://f2r4s10:5173
```

## 2. 인증서 폴더 준비

프로젝트 루트에서 실행한다.

```bash
mkdir -p gateway/certs
cd gateway/certs
```

## 3. 현재 IP 확인

```bash
hostname -i
```

출력된 실제 IP 또는 접속용 호스트명을 인증서 생성 시 포함한다.

## 4. mkcert 준비

`mkcert`가 없으면 다운로드한다.

```bash
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 -O mkcert
chmod +x mkcert
```

로컬 CA를 설치한다.

```bash
./mkcert -install
```

## 5. 인증서 재발급

`gateway/certs` 디렉토리 안에서 실행한다.

```bash
./mkcert -cert-file localhost+2.pem -key-file localhost+2-key.pem localhost 127.0.0.1 ::1 <실제IP또는호스트명>
```

호스트명을 넣는 경우:

```bash
./mkcert -cert-file localhost+2.pem -key-file localhost+2-key.pem localhost 127.0.0.1 ::1 f2r4s10
```

IP를 직접 넣는 경우:

```bash
./mkcert -cert-file localhost+2.pem -key-file localhost+2-key.pem localhost 127.0.0.1 ::1 10.12.34.56
```

## 6. frontend 인증서 복사

현재 Docker Compose에서는 `gateway/certs`를 frontend 컨테이너의 `/app/certs`로 마운트하므로 실행 자체는 `gateway/certs` 기준으로 동작한다.

그래도 로컬 파일 확인/보관용으로 `frontend/certs`에도 복사한다.

```bash
cp localhost+2.pem ../../frontend/certs/
cp localhost+2-key.pem ../../frontend/certs/
```

## 7. 실행

프로젝트 루트로 돌아간 뒤 실행한다.

```bash
cd ../..
make up
```

빌드까지 다시 할 경우:

```bash
make up-build
```

## 8. 접속

프론트엔드:

```txt
https://localhost:5173
```

원격 접속:

```txt
https://<본인주소>:5173
```

게이트웨이:

```txt
https://localhost:8000
```

상태 페이지:

```txt
http://localhost:3001
```
