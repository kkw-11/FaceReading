# 관상각 · AI 관상 풀이

카메라로 얼굴을 인식해 관상을 풀어주는 한 화면짜리 React 앱.

## 실행

Node.js 18 이상 필요.

```bash
cd gwansang
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 열고 카메라 권한을 허용합니다.
휴대폰으로 테스트하려면 카메라 때문에 HTTPS가 필요합니다(예: `npx vite --host` + 터널링 도구).

## 구조

```
src/
  App.jsx                  phase 상태(intro → camera → reading)로 한 화면 전환
  persona.js               역술가 이름/대사
  hooks/useFaceLandmarker  MediaPipe 얼굴 랜드마크 모델 로드(1회)
  components/
    CameraStage.jsx        카메라 + 얼굴 정렬 안내 + 45프레임 스캔
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
