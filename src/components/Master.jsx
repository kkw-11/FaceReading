import { useEffect } from 'react';
import MasterAvatar from './MasterAvatar';
import { useTypewriter } from '../hooks/useTypewriter';
import { MASTER } from '../persona';

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = 1.0;
  u.pitch = 0.8;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('ko'));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export default function Master({ line, voice }) {
  const { shown, done, skip } = useTypewriter(line);

  useEffect(() => {
    if (voice) speak(line);
  }, [line, voice]);

  useEffect(() => {
    if (!voice && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [voice]);

  return (
    <div className="master">
      <MasterAvatar talking={!done} />
      <div className="bubble" onClick={skip} title="클릭하면 바로 보기">
        <div className="master-name">
          {MASTER.name}
          <span>{MASTER.title}</span>
        </div>
        <p>
          {shown}
          {!done && <span className="caret" />}
        </p>
      </div>
    </div>
  );
}
