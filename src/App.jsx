import { useCallback, useState } from 'react';
import CameraStage from './components/CameraStage';
import IntroVisual from './components/IntroVisual';
import Master from './components/Master';
import ReadingPanel from './components/ReadingPanel';
import ResultFace from './components/ResultFace';
import { useFaceLandmarker } from './hooks/useFaceLandmarker';
import { buildReading } from './lib/physiognomy';
import { LINES } from './persona';

// 화면 전환 없이 phase 상태만 바꿔가며 진행: intro → camera → reading
export default function App() {
  const model = useFaceLandmarker();
  const [phase, setPhase] = useState('intro');
  const [guide, setGuide] = useState('noFace');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [voice, setVoice] = useState(false);

  const startCamera = () => {
    setGuide('noFace');
    setPhase('camera');
  };

  const handleDone = useCallback(({ metrics, snapshot }) => {
    setResult({ reading: buildReading(metrics), snapshot });
    setStep(0);
    setMaxStep(0);
    setPhase('reading');
  }, []);

  const goStep = (i) => {
    setStep(i);
    setMaxStep((m) => Math.max(m, i));
  };

  let line;
  if (phase === 'intro') line = LINES.intro;
  else if (phase === 'camera') {
    if (model.error) line = LINES.modelError;
    else if (guide === 'camError') line = LINES.camError;
    else if (!model.landmarker) line = LINES.loading;
    else line = LINES[guide];
  } else line = result.reading.sections[step].text;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">相</span>
          <div>
            <h1>관상각</h1>
            <p>AI 관상 풀이</p>
          </div>
        </div>
        <button className={`voice ${voice ? 'on' : ''}`} onClick={() => setVoice((v) => !v)}>
          {voice ? '🔊 목소리 켜짐' : '🔈 목소리 꺼짐'}
        </button>
      </header>

      <main className="layout">
        <section className="left">
          {phase === 'intro' && <IntroVisual />}
          {phase === 'camera' && (
            <CameraStage landmarker={model.landmarker} onGuide={setGuide} onDone={handleDone} />
          )}
          {phase === 'reading' && (
            <ResultFace snapshot={result.snapshot} region={result.reading.sections[step].region} />
          )}
        </section>

        <aside className="right">
          <Master line={line} voice={voice} />

          {phase === 'intro' && (
            <div className="panel intro-panel">
              <button className="primary big" onClick={startCamera}>
                관상 보러 가기
              </button>
              <p className="note">
                카메라 영상은 이 기기 안에서만 분석되고, 어디에도 저장하거나 전송하지 않아요.
              </p>
            </div>
          )}

          {phase === 'camera' && (
            <div className="panel">
              <ul className="tips">
                <li>밝은 곳에서 정면을 봐 주세요</li>
                <li>안경·앞머리는 가능하면 치워 주세요</li>
                <li>원이 금색으로 바뀌면 [관상 보기] 버튼을 눌러 주세요</li>
              </ul>
              <button className="ghost" onClick={() => setPhase('intro')}>
                처음으로
              </button>
            </div>
          )}

          {phase === 'reading' && (
            <ReadingPanel
              reading={result.reading}
              step={step}
              maxStep={maxStep}
              onStep={goStep}
              onRetry={startCamera}
            />
          )}
        </aside>
      </main>

      <footer className="footer">재미로 보는 관상입니다. 인생은 얼굴보다 마음 씀씀이가 만듭니다.</footer>
    </div>
  );
}
