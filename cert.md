


```

# 디렉토리 생성 (이미 있다면 생략 가능)
mkdir -p gateway/cert

# 해당 디렉토리로 이동
cd gateway/cert

# mkcert 다운로드
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 -O mkcert

chmod +x mkcert

# 로컬 CA 생성 (이 명령어를 실행하면 rootCA.pem과 rootCA-key.pem이 생성됨)

./mkcert -install

# 원하는 도메인/IP에 대한 인증서 생성

./mkcert localhost 127.0.0.1
```