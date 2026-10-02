# 1단계: React 앱 빌드 (src → dist)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: nginx로 dist를 https로 제공
FROM nginx:1.27-alpine
RUN apk add --no-cache openssl
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/gen-cert.sh /docker-entrypoint.d/10-gen-cert.sh
# Windows에서 CRLF로 바뀌었어도 실행되도록 줄바꿈 정리
RUN sed -i 's/\r$//' /docker-entrypoint.d/10-gen-cert.sh && chmod +x /docker-entrypoint.d/10-gen-cert.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 443
