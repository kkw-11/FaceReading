import { useEffect, useRef, useState } from 'react';
import { DrawingUtils, FaceLandmarker } from '@mediapipe/tasks-vision';
import { checkAlignment, computeMetrics, medianMetrics } from '../lib/faceMetrics';

const SAMPLES_NEEDED = 45; // 스캔에 쓸 프레임 수

const GOLD = 'rgba(232, 193, 112, 0.9)';
const GOLD_SOFT = 'rgba(232, 193, 112, 0.22)';

function takeSnapshot(video, lm) {
  const c = document.createElement('canvas');
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext('2d').drawImage(video, 0, 0);
  return {
    image: c.toDataURL('image/jpeg', 0.92),
    width: c.width,
    height: c.height,
    landmarks: lm.map(({ x, y }) => ({ x, y })),
  };
}

function drawOverlay(draw, lm, scanning, ok) {
  if (scanning) {
    draw.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: GOLD_SOFT, lineWidth: 0.6 });
    for (const set of [
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      FaceLandmarker.FACE_LANDMARKS_LIPS,
    ]) {
      draw.drawConnectors(lm, set, { color: GOLD, lineWidth: 1.5 });
    }
  }
  draw.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
    color: ok ? GOLD : 'rgba(239, 230, 212, 0.45)',
    lineWidth: 2,
  });
}

export default function CameraStage({ landmarker, onGuide, onDone }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [aligned, setAligned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [deviceId, setDeviceId] = useState(() => {
    try {
      return localStorage.getItem('cameraId') || '';
    } catch {
      return '';
    }
  });
  const startRequested = useRef(false);
  const callbacks = useRef({ onGuide, onDone });
  callbacks.current = { onGuide, onDone };

  const selectCamera = (id) => {
    setDeviceId(id);
    try {
      localStorage.setItem('cameraId', id);
    } catch {
      // 저장 못 해도 선택은 유지
    }
  };

  // 카메라 켜기 / 끄기 (선택한 카메라가 바뀌면 다시 켬)
  useEffect(() => {
    let stream;
    let cancelled = false;
    (async () => {
      const size = { width: { ideal: 1280 }, height: { ideal: 960 } };
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: deviceId ? { deviceId: { exact: deviceId }, ...size } : { facingMode: 'user', ...size },
            audio: false,
          });
        } catch (e) {
          if (!deviceId) throw e;
          // 저장해 둔 카메라가 빠져 있으면 기본 카메라로
          stream = await navigator.mediaDevices.getUserMedia({ video: size, audio: false });
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});

        // 권한을 받은 뒤에야 카메라 이름이 보임
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setCameras(devices.filter((d) => d.kind === 'videoinput'));
          setActiveId(stream.getVideoTracks()[0]?.getSettings().deviceId ?? '');
        }
      } catch {
        if (!cancelled) callbacks.current.onGuide('camError');
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId]);

  // 얼굴 인식 루프
  useEffect(() => {
    if (!landmarker) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const draw = new DrawingUtils(ctx);

    let raf;
    let lastVideoTime = -1;
    let phase = 'align';
    let lastGuide = '';
    let lastOk = false;
    const samples = [];
    let snapshot = null;

    const guide = (key) => {
      if (key !== lastGuide) {
        lastGuide = key;
        callbacks.current.onGuide(key);
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;

      const W = video.videoWidth;
      const H = video.videoHeight;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      const now = performance.now();
      const lm = landmarker.detectForVideo(video, now).faceLandmarks?.[0];
      const status = checkAlignment(lm, W, H);

      ctx.clearRect(0, 0, W, H);
      if (lm) drawOverlay(draw, lm, phase === 'scan', status.ok);
      if (status.ok !== lastOk) {
        lastOk = status.ok;
        setAligned(status.ok);
      }

      if (phase === 'align') {
        guide(status.key);
        if (startRequested.current && status.ok) {
          phase = 'scan';
          setScanning(true);
        }
        return;
      }

      // phase === 'scan'
      if (!status.ok) {
        guide(status.key === 'noFace' ? 'lost' : status.key);
        return;
      }
      guide('scanning');
      samples.push(computeMetrics(lm, W, H));
      if (samples.length === Math.floor(SAMPLES_NEEDED / 2)) snapshot = takeSnapshot(video, lm);
      setProgress(samples.length / SAMPLES_NEEDED);

      if (samples.length >= SAMPLES_NEEDED) {
        cancelAnimationFrame(raf);
        callbacks.current.onDone({ metrics: medianMetrics(samples), snapshot });
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [landmarker]);

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div className={`stage camera ${aligned ? 'aligned' : ''} ${scanning ? 'scanning' : ''}`}>
      <video ref={videoRef} playsInline muted />
      <canvas ref={canvasRef} className="overlay" />

      <svg className="guide" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <mask id="oval-mask">
            <rect width="400" height="300" fill="white" />
            <ellipse cx="200" cy="150" rx="84" ry="112" fill="black" />
          </mask>
        </defs>
        <rect width="400" height="300" fill="rgba(12,10,8,0.55)" mask="url(#oval-mask)" />
        <ellipse className="guide-oval" cx="200" cy="150" rx="84" ry="112" />
      </svg>

      {scanning && <div className="scanline" />}

      {scanning && (
        <div className="progress">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} className="track" />
            <circle
              cx="50"
              cy="50"
              r={R}
              className="bar"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      )}

      {landmarker && !scanning && (
        <button
          className="primary start-scan"
          disabled={!aligned}
          onClick={() => {
            startRequested.current = true;
          }}
        >
          {aligned ? '관상 보기' : '얼굴을 원 안에 맞춰 주세요'}
        </button>
      )}

      {cameras.length > 1 && !scanning && (
        <select
          className="camera-select"
          value={activeId}
          onChange={(e) => selectCamera(e.target.value)}
          aria-label="카메라 선택"
        >
          {cameras.map((c, i) => (
            <option key={c.deviceId} value={c.deviceId}>
              📷 {c.label || `카메라 ${i + 1}`}
            </option>
          ))}
        </select>
      )}

      {!landmarker && <div className="stage-loading">도사님이 돋보기를 챙기는 중…</div>}
    </div>
  );
}
