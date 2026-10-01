// 갓 쓴 역술가 캐릭터 (SVG 일러스트)
export default function MasterAvatar({ talking }) {
  return (
    <svg className={`avatar ${talking ? 'talking' : ''}`} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" className="avatar-moon" />

      {/* 도포 */}
      <path d="M28 200 C34 160 62 146 100 146 C138 146 166 160 172 200 Z" fill="#1d2a3f" />
      <path d="M78 148 L100 186 L122 148 L112 146 L100 168 L88 146 Z" fill="#efe6d4" />

      {/* 귀, 얼굴 */}
      <ellipse cx="65" cy="106" rx="7" ry="11" fill="#e3b995" />
      <ellipse cx="135" cy="106" rx="7" ry="11" fill="#e3b995" />
      <ellipse cx="100" cy="104" rx="35" ry="41" fill="#efc9a4" />

      {/* 눈썹 (흰 눈썹) */}
      <path d="M72 88 Q82 80 94 87" stroke="#f4f1ea" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M106 87 Q118 80 128 88" stroke="#f4f1ea" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* 지긋이 웃는 눈 */}
      <g className="avatar-eyes">
        <path d="M76 99 Q83 94 90 99" stroke="#3a2a20" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M110 99 Q117 94 124 99" stroke="#3a2a20" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* 코, 볼 */}
      <path d="M100 100 Q96 114 101 117" stroke="#c99a78" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="78" cy="114" r="6" fill="#e9a08a" opacity="0.45" />
      <circle cx="122" cy="114" r="6" fill="#e9a08a" opacity="0.45" />

      {/* 수염 */}
      <path d="M80 128 Q100 190 120 128 Q100 138 80 128 Z" fill="#f4f1ea" />
      <ellipse className="avatar-mouth" cx="100" cy="129" rx="6" ry="2.5" fill="#6b2e24" />
      <path d="M100 124 Q88 120 76 128" stroke="#f4f1ea" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M100 124 Q112 120 124 128" stroke="#f4f1ea" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* 갓 */}
      <path d="M66 74 L70 26 Q100 18 130 26 L134 74 Z" fill="#141210" opacity="0.92" />
      <rect x="68" y="62" width="64" height="7" fill="#2b2622" />
      <ellipse cx="100" cy="72" rx="78" ry="12" fill="#141210" opacity="0.88" />
      <ellipse cx="100" cy="70" rx="78" ry="12" fill="none" stroke="#3a332c" strokeWidth="1.5" />
      <path d="M36 76 Q48 140 72 150" stroke="#141210" strokeWidth="1.5" fill="none" strokeDasharray="1 5" strokeLinecap="round" />
      <path d="M164 76 Q152 140 128 150" stroke="#141210" strokeWidth="1.5" fill="none" strokeDasharray="1 5" strokeLinecap="round" />
    </svg>
  );
}
