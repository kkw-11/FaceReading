# 관상각 · AI 관상 풀이

카메라로 얼굴을 인식해 관상을 풀어주는 한 화면짜리 React 앱.

## 1. 코드 받기

### 처음 받을 때 (clone)

```bash
git clone https://github.com/kkw-11/FaceReading.git
cd FaceReading
git checkout dev        # 작업 브랜치
```

SSH 키를 등록했다면 `git clone git@github.com:kkw-11/FaceReading.git`로 받아도 됩니다.

### 이미 받은 적이 있을 때 (pull)

```bash
cd FaceReading
git pull
```

pull할 때 `Your local changes ... would be overwritten` 오류가 나고 목록에 `node_modules/` 파일만 있다면,
아래처럼 되돌린 뒤 다시 pull합니다. `node_modules`는 어차피 다시 설치하는 폴더입니다.

```bash
git restore node_modules
git pull
```

> **Docker를 쓴다면** 2~4번(Node.js 설치, 의존성 설치, 실행)은 건너뛰고 **5. Docker로 실행**만 보면 됩니다.

## 2. Node.js 설치

Node.js 18 이상이 필요합니다. 이미 설치되어 있다면 3번으로 넘어가세요.

```bash
node -v   # v18.x 이상이 나오면 설치되어 있음
```

### Windows

**방법 A. 설치 파일**
1. https://nodejs.org 에서 **LTS** 버전을 받아 기본 설정으로 설치합니다.
2. 열려 있던 터미널과 VS Code를 **완전히 껐다가 다시 켭니다**. 그래야 `node` 명령이 인식됩니다.

**방법 B. winget (PowerShell)**

```powershell
winget install OpenJS.NodeJS.LTS
```
설치 후 터미널을 다시 엽니다.

**PowerShell에서 `npm` 실행 시 "스크립트를 실행할 수 없습니다" 오류가 날 때**

둘 중 하나로 해결합니다.

```powershell
npm.cmd run dev                                       # 매번 npm 대신 npm.cmd 사용
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # 한 번 설정하면 npm 그대로 사용 가능
```

### Linux (Ubuntu / Debian / Raspberry Pi OS)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```
라즈베리파이는 64비트 OS를 권장합니다(`uname -m` 결과가 `aarch64`). 32비트(`armv7l`)에서는 최신 Node.js 설치가 막힐 수 있습니다.

## 3. 의존성 설치

```bash
npm ci
```
clone 직후 한 번, 그리고 pull로 `package.json`이 바뀌었을 때 다시 실행합니다.

## 4. 실행

| 용도 | 명령 | 접속 주소 |
| --- | --- | --- |
| 개발 (코드 수정 즉시 반영) | `npm run dev` | https://localhost:5173 |
| 서버 (다른 기기에서 접속) | `npm run build` 후 `npm run preview -- --port 4173` | https://<서버 IP>:4173 |
| 시연 (이 기기 브라우저에서만) | `npm run demo` | http://localhost:4173 |

- 브라우저는 https 또는 localhost에서만 카메라를 허용합니다. 그래서 dev와 preview는 자체 서명 인증서로 https를 제공합니다.
- 처음 접속하면 **"연결이 비공개로 설정되어 있지 않습니다"** 경고가 나옵니다. **고급 → (안전하지 않음)(으)로 이동**을 누르면 됩니다.
- `demo` 모드는 localhost 전용이라 인증서 경고가 없습니다. 발표나 시연용입니다.
- 코드를 수정했다면 preview나 demo 전에 반드시 다시 빌드해야 합니다. `demo`는 빌드를 자동으로 함께 합니다.
- 얼굴 인식 모델은 처음 실행할 때 인터넷에서 받아오므로 인터넷 연결이 필요합니다.
- 서버 IP는 Windows에서는 `ipconfig`, Linux에서는 `hostname -I`로 확인합니다.

### 서버로 계속 띄워 두기 (Linux, pm2)

터미널을 닫아도, 재부팅해도 계속 실행되게 합니다.

```bash
sudo npm install -g pm2
npm run build
pm2 start npm --name gwansang -- run preview -- --port 4173
pm2 save && pm2 startup   # 출력된 sudo 명령을 한 번 실행하면 재부팅 후에도 자동 실행
```

| 하고 싶은 것 | 명령 |
| --- | --- |
| 상태 확인 | `pm2 status` |
| 로그 보기 | `pm2 logs gwansang` |
| 재시작 / 중지 | `pm2 restart gwansang` / `pm2 stop gwansang` |

### 코드 업데이트 후 다시 반영

```bash
git pull
npm ci
npm run build
pm2 restart gwansang      # pm2를 안 쓰면 preview를 다시 실행
```

## 5. Docker로 실행

Node.js를 설치하지 않아도 되고, 누가 실행하든 같은 환경(Node 22, nginx)으로 동작합니다.
React 앱을 빌드한 뒤 nginx가 https로 제공합니다.

### Docker 설치

#### Windows에 Docker 설치

1. <https://www.docker.com/products/docker-desktop> 에서 Docker Desktop을 설치합니다. 설치 중 WSL2 사용을 선택합니다.
2. 설치 후 재부팅하고, Docker Desktop을 실행해 둡니다(작업 표시줄에 고래 아이콘).

#### Linux에 Docker 설치 (Ubuntu / Debian / Raspberry Pi OS)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER     # sudo 없이 docker 명령 사용
```

설정을 적용하려면 로그아웃했다가 다시 로그인합니다(또는 재부팅).

```bash
docker --version && docker compose version   # 설치 확인
```

### 서버 실행

```bash
cd FaceReading
docker compose up -d --build
```

- 접속 주소: `https://<서버 IP>:4173` (같은 기기에서는 `https://localhost:4173`)
- 처음 접속하면 인증서 경고가 나옵니다. **고급 → (안전하지 않음)(으)로 이동**을 누르면 됩니다.
- 인증서는 처음 실행할 때 자동으로 만들어지고 `certs` 볼륨에 저장됩니다. 컨테이너를 다시 만들어도 같은 인증서를 씁니다.
- 컨테이너는 `-d` 옵션으로 백그라운드에서 실행되므로 터미널을 닫아도 계속 동작합니다. 재부팅하거나 Docker를 다시 켠 뒤에는 `docker compose up -d`로 다시 실행합니다.
- 라즈베리파이에서는 첫 빌드에 몇 분 걸릴 수 있습니다.

| 하고 싶은 것 | 명령 |
| --- | --- |
| 상태 확인 | `docker compose ps` |
| 로그 보기 | `docker compose logs -f web` |
| 중지 | `docker compose down` |
| 코드 업데이트 후 반영 | `git pull && docker compose up -d --build` |

### 개발 환경 (선택)

코드를 수정하면서 바로 확인하고 싶을 때 씁니다. 소스 폴더가 컨테이너에 연결됩니다.

```bash
docker compose --profile dev up dev
```

- 접속 주소: `https://localhost:5173`
- 종료는 `Ctrl + C`
- Windows에서는 파일 변경 반영이 1~2초 늦을 수 있습니다. 개발은 Node.js를 직접 설치해서 `npm run dev`로 하는 편이 더 빠릅니다.

## 구조

```
src/
  App.jsx                  phase 상태(intro → camera → reading)로 한 화면 전환
  persona.js               역술가 이름/대사
  hooks/useFaceLandmarker  MediaPipe 얼굴 랜드마크 모델 로드(1회)
  components/
    CameraStage.jsx        카메라 + 얼굴 정렬 안내 + 버튼으로 45프레임 스캔
    ResultFace.jsx         캡처 사진 위에 현재 풀이 부위 강조
    Master.jsx             역술가 캐릭터 + 말풍선(타자기 효과, 음성 선택)
    ReadingPanel.jsx       부위별 탭, 키워드, 운세 점수
  lib/
    landmarks.js           랜드마크 인덱스 / 강조 영역
    faceMetrics.js         랜드마크 → 비율 측정, 정렬 판정
    physiognomy.js         측정값 → 관상 풀이 규칙, 기준값(BASELINE)
```

## 기준값 보정

`physiognomy.js`의 `BASELINE`은 추정치입니다. 결과 화면 하단의 **측정값 보기**를 열어
여러 사람의 값을 모은 뒤 평균(mean)과 편차(sd)를 맞추면 풀이가 더 고르게 나옵니다.

영상은 브라우저 안에서만 처리되며 서버로 전송되지 않습니다.
