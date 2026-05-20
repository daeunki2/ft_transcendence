1. vscode에서 f2r4s11 으로 검색하여
본인의 실제 ip주소로 교체

2. 인증서 재발급 -  gateway/certs/ 들어가서:
  mkcert -cert-file localhost+2.pem -key-file localhost+2-key.pem localhost 127.0.0.1 ::1 <실제IP>
3. 발급 후 frontend/certs/로 복사.

사용자가 실제 IP로 교체할 곳