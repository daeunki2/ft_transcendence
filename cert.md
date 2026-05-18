


```
# 1. mkcert 설치 (Mac 기준 / Windows는 choco install mkcert)
brew install mkcert
brew install nss # 파이어폭스 브라우저 대응용

# 2. mkcert를 로컬 컴퓨터의 신뢰할 수 있는 기관으로 등록 (최초 1회만)
mkcert -install

# 3. gateway/cert 이동 후 localhost용 인증서 발급
mkcert localhost 127.0.0.1 ::1
```