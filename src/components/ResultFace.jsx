import { useEffect, useRef, useState } from 'react';
import { IDX, REGIONS } from '../lib/landmarks';

const GOLD = '#f0cf85';
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// 얼굴 주변을 3:4 비율로 잘라낼 영역 계산
function cropBox(snapshot) {
  const { width: W, height: H, landmarks } = snapshot;
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (const p of landmarks) {
    minX = Math.min(minX, p.x * W);
    maxX = Math.max(maxX, p.x * W);
    minY = Math.min(minY, p.y * H);
    maxY = Math.max(maxY, p.y * H);
  }
  const fw = maxX - minX;
  const fh = maxY - minY;
  let sh = fh * 1.6;
  let sw = sh * 0.75;
  if (sw < fw * 1.5) {
    sw = fw * 1.5;
    sh = sw / 0.75;
  }
  sw = Math.min(sw, W);
  sh = Math.min(sh, H);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2 - fh * 0.06;
  return {
    sx: clamp(cx - sw / 2, 0, W - sw),
    sy: clamp(cy - sh / 2, 0, H - sh),
    sw,
    sh,
  };
}

function tracePath(ctx, pts, close) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  if (close) ctx.closePath();
}

function drawLabel(ctx, text, pts, u, cw, strong) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const midY = (Math.min(...ys) + Math.max(...ys)) / 2;

  ctx.font = `${strong ? 700 : 400} ${Math.round(u * (strong ? 3.6 : 2.8))}px "Gowun Batang", serif`;
  const tw = ctx.measureText(text).width;
  const padX = u * 1.4;
  const boxH = u * (strong ? 5.4 : 4.4);
  let x = maxX + u * 3;
  if (x + tw + padX * 2 > cw - u) x = minX - u * 3 - tw - padX * 2;
  x = clamp(x, u, cw - tw - padX * 2 - u);
  const y = midY - boxH / 2;

  ctx.fillStyle = strong ? 'rgba(20, 16, 12, 0.85)' : 'rgba(20, 16, 12, 0.6)';
  ctx.strokeStyle = strong ? GOLD : 'rgba(240, 207, 133, 0.4)';
  ctx.lineWidth = u * 0.25;
  ctx.beginPath();
  ctx.roundRect(x, y, tw + padX * 2, boxH, boxH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = strong ? GOLD : '#efe6d4';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, midY + u * 0.2);
}

function drawRegion(ctx, region, P, u, cw, strong) {
  const polys = (region.polys ?? []).map((r) => r.map(P));
  const lines = (region.lines ?? []).map((r) => r.map(P));

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = strong ? GOLD : 'rgba(240, 207, 133, 0.45)';
  ctx.lineWidth = u * (strong ? 0.6 : 0.3);
  if (strong) {
    ctx.shadowColor = 'rgba(240, 207, 133, 0.9)';
    ctx.shadowBlur = u * 3;
  }
  ctx.fillStyle = 'rgba(240, 207, 133, 0.16)';
  for (const pts of polys) {
    tracePath(ctx, pts, true);
    if (strong) ctx.fill();
    ctx.stroke();
  }
  for (const pts of lines) {
    tracePath(ctx, pts, false);
    ctx.stroke();
  }
  ctx.restore();

  drawLabel(ctx, region.label, [...polys, ...lines].flat(), u, cw, strong);
}

function drawSamjeong(ctx, P, u, cw) {
  const faceL = P(IDX.cheekL).x; // 좌우 반전 후 화면 왼쪽
  const faceR = P(IDX.cheekR).x;
  const left = Math.min(faceL, faceR) - u * 4;
  const right = Math.max(faceL, faceR) + u * 4;
  const ys = [
    P(IDX.foreheadTop).y,
    (P(IDX.browRPeak).y + P(IDX.browLPeak).y) / 2,
    P(IDX.subnasale).y,
    P(IDX.chin).y,
  ];
  const names = ['상정 · 초년', '중정 · 중년', '하정 · 말년'];
  const tints = ['rgba(240,207,133,0.10)', 'rgba(240,207,133,0.18)', 'rgba(240,207,133,0.10)'];

  ctx.save();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = tints[i];
    ctx.fillRect(left, ys[i], right - left, ys[i + 1] - ys[i]);
  }
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = u * 0.3;
  ctx.setLineDash([u * 1.2, u * 1]);
  for (const y of ys) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
  ctx.restore();

  for (let i = 0; i < 3; i++) {
    drawLabel(ctx, names[i], [{ x: right - u * 3, y: ys[i] }, { x: right - u * 3, y: ys[i + 1] }], u, cw, true);
  }
}

export default function ResultFace({ snapshot, region }) {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = snapshot.image;
  }, [snapshot]);

  useEffect(() => {
    if (!img) return;
    const { width: W, height: H, landmarks } = snapshot;
    const { sx, sy, sw, sh } = cropBox(snapshot);
    const k = Math.min(2, 1000 / sh);
    const cw = Math.round(sw * k);
    const ch = Math.round(sh * k);
    const u = cw / 100;

    const canvas = canvasRef.current;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    // 거울처럼 좌우 반전해서 그리기
    ctx.save();
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    ctx.restore();
    ctx.fillStyle = 'rgba(14, 11, 8, 0.38)';
    ctx.fillRect(0, 0, cw, ch);

    const P = (i) => ({
      x: cw - (landmarks[i].x * W - sx) * k,
      y: (landmarks[i].y * H - sy) * k,
    });

    if (region === 'all') {
      for (const key of ['forehead', 'eyes', 'nose', 'mouth']) drawRegion(ctx, REGIONS[key], P, u, cw, false);
    } else if (region === 'samjeong') {
      drawSamjeong(ctx, P, u, cw);
    } else if (REGIONS[region]) {
      drawRegion(ctx, REGIONS[region], P, u, cw, true);
    }
  }, [img, snapshot, region]);

  return (
    <div className="stage result">
      <canvas ref={canvasRef} />
      <div className="seal">觀相</div>
    </div>
  );
}
