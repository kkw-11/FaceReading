import { IDX as I } from './landmarks';

const avg = (a, b) => (a + b) / 2;

// 픽셀 좌표로 바꾼 뒤, 두 눈 안쪽 끝을 잇는 선이 수평이 되도록 회전 (고개 기울기 보정)
function normalizedPoints(lm, w, h) {
  const pts = lm.map((p) => ({ x: p.x * w, y: p.y * h }));
  const a = pts[I.eyeRInner];
  const b = pts[I.eyeLInner];
  const cx = avg(a.x, b.x);
  const cy = avg(a.y, b.y);
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const cos = Math.cos(-ang);
  const sin = Math.sin(-ang);
  return pts.map(({ x, y }) => {
    const dx = x - cx;
    const dy = y - cy;
    return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
  });
}

// 한 프레임의 랜드마크 → 관상용 비율 값 (모두 크기와 무관한 비율)
//
// 분모 규칙: 관상서가 정성적으로 말한 값을 수치로 표현하기 위해, 문장이 무엇과 비교하는지로 분모를 정한다.
//   1) 비교 대상이 명시된 경우 → 그 대상   (삼정은 얼굴 길이를 셋으로 나눈 것, 눈썹은 눈보다 길어야 한다)
//   2) 얼굴 안에서 크다/넓다/길다 → 같은 축의 얼굴 치수 (가로 = cheekW, 세로 = faceH)
//   3) 모양(가늘다, 올라갔다, 도톰하다) → 그 부위 자신의 치수
// 2)에서 축을 맞추는 이유: 고개를 숙이거나 들면 세로만 줄어드는데, 같은 축끼리 나누면 상쇄된다.
export function computeMetrics(lm, w, h) {
  const n = normalizedPoints(lm, w, h);
  const d = (i, j) => Math.hypot(n[i].x - n[j].x, n[i].y - n[j].y);

  const faceH = n[I.chin].y - n[I.foreheadTop].y;
  const cheekW = d(I.cheekR, I.cheekL);
  const eyeWR = d(I.eyeROuter, I.eyeRInner);
  const eyeWL = d(I.eyeLOuter, I.eyeLInner);
  const eyeW = avg(eyeWR, eyeWL);
  const innerGap = d(I.eyeRInner, I.eyeLInner);
  const noseW = d(I.noseWingR, I.noseWingL);
  const mouthW = d(I.mouthR, I.mouthL);
  const browY = avg(n[I.browRPeak].y, n[I.browLPeak].y);
  const noseBaseY = n[I.subnasale].y;

  // 눈꼬리가 올라갈수록 양수
  const tiltR = (n[I.eyeRInner].y - n[I.eyeROuter].y) / eyeWR;
  const tiltL = (n[I.eyeLInner].y - n[I.eyeLOuter].y) / eyeWL;
  // 입꼬리가 올라갈수록 양수
  const lipCenterY = avg(n[I.upperLipBottom].y, n[I.lowerLipTop].y);
  const cornerY = avg(n[I.mouthR].y, n[I.mouthL].y);

  return {
    // 얼굴형(오행) — 3) 윤곽의 모양: 얼굴 치수끼리 비교
    faceRatio: cheekW / faceH,
    jawRatio: d(I.jawR, I.jawL) / cheekW,
    foreheadRatio: d(I.foreheadR, I.foreheadL) / cheekW,

    // 삼정 — 1) 얼굴 세로를 셋으로 나눈 비교
    upper: (browY - n[I.foreheadTop].y) / faceH,
    middle: (noseBaseY - browY) / faceH,
    lower: (n[I.chin].y - noseBaseY) / faceH,

    // 눈썹 — 전택궁 간격: 2) 세로 크기 / 길이: 1) 눈보다 길어야 한다(眉長過目)
    browGap: avg(n[I.eyeRTop].y - n[I.browRPeak].y, n[I.eyeLTop].y - n[I.browLPeak].y) / faceH,
    browLen: avg(d(I.browRInner, I.browROuter), d(I.browLInner, I.browLOuter)) / eyeW,

    // 눈 — 크기·기울기: 3) 모양 / 눈 사이: 2) 가로 크기
    eyeOpen: avg(d(I.eyeRTop, I.eyeRBottom) / eyeWR, d(I.eyeLTop, I.eyeLBottom) / eyeWL),
    eyeTilt: (Math.atan(avg(tiltR, tiltL)) * 180) / Math.PI,
    eyeGap: innerGap / cheekW,

    // 코 — 길이: 2) 세로 크기 / 콧방울: 2) 가로 크기
    noseLen: (noseBaseY - n[I.noseBridge].y) / faceH,
    noseWidth: noseW / cheekW,

    // 입 — 폭: 2) 가로 크기 / 두께·입꼬리: 3) 모양(앙월구)
    mouthWidth: mouthW / cheekW,
    lipThick:
      (n[I.upperLipBottom].y - n[I.upperLipTop].y + (n[I.lowerLipBottom].y - n[I.lowerLipTop].y)) /
      mouthW,
    mouthCurve: (lipCenterY - cornerY) / mouthW,

    // 인중·턱(지각) — 2) 세로 크기
    philtrum: (n[I.upperLipTop].y - noseBaseY) / faceH,
    chinLen: (n[I.chin].y - n[I.lowerLipBottom].y) / faceH,
  };
}

// 여러 프레임의 중앙값 (눈 깜빡임·흔들림에 강함)
export function medianMetrics(samples) {
  const out = {};
  for (const k of Object.keys(samples[0])) {
    const v = samples.map((s) => s[k]).sort((a, b) => a - b);
    out[k] = v[Math.floor(v.length / 2)];
  }
  return out;
}

// 얼굴이 스캔하기 좋은 위치/자세인지 판단
export function checkAlignment(lm, w, h) {
  if (!lm) return { ok: false, key: 'noFace' };

  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const p of lm) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const size = maxY - minY;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  if (size < 0.35) return { ok: false, key: 'tooFar' };
  if (size > 0.85) return { ok: false, key: 'tooClose' };
  if (Math.abs(cx - 0.5) > 0.12 || Math.abs(cy - 0.5) > 0.15) return { ok: false, key: 'offCenter' };

  const L = lm[I.cheekR];
  const R = lm[I.cheekL];
  const yaw = (lm[I.noseTip].x - L.x) / (R.x - L.x);
  if (yaw < 0.4 || yaw > 0.6) return { ok: false, key: 'turned' };

  const a = lm[I.eyeRInner];
  const b = lm[I.eyeLInner];
  const roll = (Math.atan2((b.y - a.y) * h, (b.x - a.x) * w) * 180) / Math.PI;
  if (Math.abs(roll) > 8) return { ok: false, key: 'tilted' };

  return { ok: true, key: 'ok' };
}
