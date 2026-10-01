// 첫 화면 왼쪽: 먹선으로 그린 관상도
export default function IntroVisual() {
  return (
    <div className="stage intro">
      <svg viewBox="0 0 400 300" aria-hidden="true">
        <g className="ink">
          <ellipse cx="200" cy="150" rx="78" ry="104" />
          <path d="M150 104 Q168 94 186 102" />
          <path d="M214 102 Q232 94 250 104" />
          <path d="M158 122 Q170 114 184 122 Q170 128 158 122 Z" />
          <path d="M216 122 Q230 114 242 122 Q230 128 216 122 Z" />
          <path d="M200 110 L194 164 Q200 170 206 164" />
          <path d="M176 194 Q200 184 224 194 Q200 208 176 194 Z" />
        </g>
        <g className="bands">
          <line x1="96" x2="304" y1="46" y2="46" />
          <line x1="96" x2="304" y1="100" y2="100" />
          <line x1="96" x2="304" y1="170" y2="170" />
          <line x1="96" x2="304" y1="254" y2="254" />
        </g>
        <g className="band-labels">
          <text x="312" y="78">상정 · 초년</text>
          <text x="312" y="140">중정 · 중년</text>
          <text x="312" y="216">하정 · 말년</text>
          <text x="88" y="78" textAnchor="end">관록궁</text>
          <text x="88" y="126" textAnchor="end">감찰관</text>
          <text x="88" y="160" textAnchor="end">재백궁</text>
          <text x="88" y="198" textAnchor="end">출납관</text>
        </g>
      </svg>
      <div className="intro-caption">
        <strong>얼굴에 새겨진 운을 읽어 드립니다</strong>
        <ol>
          <li>카메라를 켜고</li>
          <li>얼굴을 원 안에 맞추면</li>
          <li>도사님이 풀이해 드려요</li>
        </ol>
      </div>
    </div>
  );
}
