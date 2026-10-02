#!/bin/sh
# 인증서가 없을 때만 자체 서명 인증서를 만든다.
# certs 볼륨에 저장되므로 컨테이너를 다시 만들어도 같은 인증서를 계속 쓴다.
set -e

CERT_DIR=/etc/nginx/certs

if [ ! -f "$CERT_DIR/cert.pem" ] || [ ! -f "$CERT_DIR/key.pem" ]; then
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
    -subj "/CN=gwansang" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
    -keyout "$CERT_DIR/key.pem" \
    -out "$CERT_DIR/cert.pem"
  echo "gen-cert: self-signed certificate created"
fi
