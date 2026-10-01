import { BASELINE } from '../lib/physiognomy';

function Scores({ scores, type }) {
  return (
    <div className="scores">
      {scores.map((s) => (
        <div className="score" key={s.label}>
          <span className="score-label">{s.label}</span>
          <div className="score-track">
            <div className="score-fill" style={{ width: `${s.value}%` }} />
          </div>
          <span className="score-value">{s.value}</span>
        </div>
      ))}
      <div className="lucky">
        <span className="swatch" style={{ background: type.color.hex }} />
        행운의 색 <b>{type.color.name}</b>
        <span className="dot">·</span>
        행운의 방향 <b>{type.direction}</b>
      </div>
    </div>
  );
}

export default function ReadingPanel({ reading, step, maxStep, onStep, onRetry }) {
  const { sections, scores, type, metrics, z } = reading;
  const cur = sections[step];
  const last = step === sections.length - 1;

  return (
    <div className="panel">
      <nav className="tabs">
        {sections.map((s, i) => (
          <button
            key={s.key}
            className={i === step ? 'active' : ''}
            disabled={i > maxStep}
            onClick={() => onStep(i)}
          >
            {s.short}
          </button>
        ))}
      </nav>

      <article className="card" key={cur.key}>
        <header>
          <h2>{cur.title}</h2>
          {cur.palace && <span className="palace">{cur.palace}</span>}
        </header>
        {cur.keywords?.length > 0 && (
          <ul className="chips">
            {cur.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        )}
        {cur.key === 'summary' && <Scores scores={scores} type={type} />}
      </article>

      <div className="controls">
        <button className="ghost" onClick={() => onStep(step - 1)} disabled={step === 0}>
          ◂ 이전
        </button>
        {last ? (
          <button className="primary" onClick={onRetry}>
            다른 얼굴 보기
          </button>
        ) : (
          <button className="primary" onClick={() => onStep(step + 1)}>
            다음 이야기 ▸
          </button>
        )}
      </div>

      <details className="debug">
        <summary>측정값 보기 (기준값 보정용)</summary>
        <table>
          <tbody>
            {Object.keys(BASELINE).map((k) => (
              <tr key={k}>
                <td>{BASELINE[k].label}</td>
                <td>{metrics[k].toFixed(3)}</td>
                <td className={Math.abs(z[k]) >= 0.75 ? 'hi' : ''}>z {z[k].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
