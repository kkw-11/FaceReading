// 측정값 → 관상 풀이
// BASELINE은 "보통 얼굴"의 추정 평균/편차입니다. 결과 화면의 '측정값 보기'를 보며 여러 사람을 찍어 보고 보정하세요.
export const BASELINE = {
  faceRatio: { mean: 0.9, sd: 0.06, label: '광대폭/얼굴길이' },
  jawRatio: { mean: 0.8, sd: 0.05, label: '턱폭/광대폭' },
  foreheadRatio: { mean: 0.78, sd: 0.05, label: '이마폭/광대폭' },
  upper: { mean: 0.28, sd: 0.03, label: '상정 비율' },
  middle: { mean: 0.35, sd: 0.03, label: '중정 비율' },
  lower: { mean: 0.37, sd: 0.03, label: '하정 비율' },
  eyeOpen: { mean: 0.28, sd: 0.05, label: '눈 세로/가로' },
  eyeTilt: { mean: 4, sd: 4, label: '눈꼬리 각도(°)' },
  eyeGap: { mean: 1.05, sd: 0.1, label: '눈 사이/눈 길이' },
  browGap: { mean: 0.075, sd: 0.012, label: '눈썹-눈 간격' },
  browLen: { mean: 1.45, sd: 0.15, label: '눈썹 길이/눈 길이' },
  noseLen: { mean: 0.25, sd: 0.02, label: '코 길이' },
  noseWidth: { mean: 1.0, sd: 0.1, label: '콧방울/눈 사이' },
  mouthWidth: { mean: 1.45, sd: 0.15, label: '입 폭/코 폭' },
  lipThick: { mean: 0.3, sd: 0.06, label: '입술 두께' },
  mouthCurve: { mean: 0, sd: 0.04, label: '입꼬리' },
  philtrum: { mean: 0.07, sd: 0.012, label: '인중 길이' },
  chinLen: { mean: 0.14, sd: 0.02, label: '턱 길이' },
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const levelOf = (z) => (z >= 0.75 ? 'high' : z <= -0.75 ? 'low' : 'mid');

// 받침 유무에 따라 '이에요/예요' 선택
const hasBatchim = (word) => {
  const c = word.charCodeAt(word.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
};
const ieyo = (word) => `${word}${hasBatchim(word) ? '이에요' : '예요'}`;

// 오행 얼굴형
const TYPES = {
  wood: {
    name: '목형(木形)',
    text: '얼굴이 길쭉하고 반듯한 목형(木形) 얼굴이에요. 나무처럼 위로 쭉쭉 뻗어가는 기운이라 배움하고 성장이 인생 키워드예요. 한번 뜻을 세우면 꼿꼿하게 밀고 나가는데, 너무 곧으면 부러지니까 가끔은 휘어질 줄도 아셔야 해요.',
    keywords: ['성장', '학구열', '원칙'],
    motto: '꾸준히 자라서 큰 그늘을 만드는 나무',
    color: { name: '초록', hex: '#4f8a5b' },
    direction: '동쪽',
  },
  fire: {
    name: '화형(火形)',
    text: '이마 쪽이 넓고 턱으로 갈수록 갸름해지는 화형(火形)이에요. 불처럼 머리 회전이 빠르고 감각이 좋아요. 아이디어가 번뜩이는 사람이에요. 다만 불은 빨리 타오르고 빨리 식거든요. 시작한 일 끝까지 마무리하는 습관만 들이면 크게 됩니다.',
    keywords: ['총명', '감각', '열정'],
    motto: '어둠을 환하게 밝히는 등불',
    color: { name: '빨강', hex: '#b8433a' },
    direction: '남쪽',
  },
  earth: {
    name: '토형(土形)',
    text: '하관이 두둑하고 얼굴이 든든한 토형(土形)이에요. 땅처럼 묵직하고 믿음직해서 사람들이 기대러 와요. 재물이 한번 들어오면 잘 안 나가는 얼굴이에요. 대신 변화에 좀 느린 편이니까, 기회 왔을 땐 한 박자 빠르게 움직이세요.',
    keywords: ['신용', '재물', '뚝심'],
    motto: '모두가 기대어 쉬는 큰 산',
    color: { name: '황토색', hex: '#c69a45' },
    direction: '중앙',
  },
  metal: {
    name: '금형(金形)',
    text: '턱선이 또렷하고 각이 살아 있는 금형(金形)이에요. 쇠처럼 결단력 있고 의리가 있어요. 리더 자리에 앉으면 빛나는 얼굴이에요. 말이 좀 직설적일 수 있으니까, 한 번 부드럽게 감싸서 말하면 적이 없어요.',
    keywords: ['결단력', '의리', '리더십'],
    motto: '갈고 닦을수록 빛나는 보검',
    color: { name: '흰색', hex: '#e9e4d8' },
    direction: '서쪽',
  },
  water: {
    name: '수형(水形)',
    text: '얼굴선이 둥글고 부드러운 수형(水形)이에요. 물처럼 어디든 스며드는 친화력이 최고예요. 사람 복, 인기 복이 있는 얼굴이에요. 물은 고이면 안 되니까, 계속 움직이고 사람 만나는 게 운을 키우는 길이에요.',
    keywords: ['친화력', '인복', '유연함'],
    motto: '막히면 돌아서 결국 바다에 이르는 강물',
    color: { name: '남색', hex: '#2f4a7a' },
    direction: '북쪽',
  },
};

function faceType(z) {
  if (z.jawRatio > 0.8 && z.faceRatio > 0) return 'earth';
  if (z.jawRatio > 0.5) return 'metal';
  if (z.faceRatio > 0.6) return 'water';
  if (z.jawRatio < -0.6 && z.foreheadRatio > -0.3) return 'fire';
  if (z.faceRatio < -0.5) return 'wood';
  return z.faceRatio >= 0 ? 'water' : 'wood';
}

// 부위별 문장: [level] = { text, kw }  (mid의 text가 ''이면 해당 문장은 생략)
const T = {
  upper: {
    high: { kw: ['총명', '윗사람 복'], text: '이마가 넓고 시원하게 잘생겼어요. 이마는 초년운하고 관록, 부모 덕을 보는 자리인데, 이런 이마는 머리가 좋고 윗사람 도움을 잘 받아요. 일찍부터 자기 자리를 잡는 상이에요.' },
    mid: { kw: ['안정', '성실'], text: '이마가 반듯하고 알맞아요. 초년에 큰 굴곡 없이 차근차근 올라가는 상이에요. 스스로 쌓은 실력이 결국 관록이 되는 타입이에요.' },
    low: { kw: ['자수성가', '실전형'], text: '이마가 아담한 편이에요. 이런 분들은 초년에 스스로 길 개척하느라 고생 좀 했을 수 있어요. 그런데 걱정 마세요. 실전 감각이 뛰어나서 중년 이후에 확 피는 경우가 많아요. 앞머리를 올려서 이마를 드러내면 운이 트입니다.' },
  },
  browGap: {
    high: { kw: ['여유', '집안 복'], text: '눈썹하고 눈 사이, 전택궁이 넓어요. 마음이 넉넉하고 여유가 있어서 집안 복, 부동산 복이 따라요.' },
    mid: { kw: ['감정 조절'], text: '눈썹과 눈 사이가 알맞게 떨어져 있어서 감정 조절을 잘하는 편이에요.' },
    low: { kw: ['행동력'], text: '눈썹과 눈 사이가 가까워요. 판단이 빠르고 행동력이 좋아요. 다만 성격이 좀 급할 수 있으니 중요한 결정은 하룻밤 자고 하세요.' },
  },
  browLen: {
    high: { kw: ['형제·친구 복'], text: '눈썹이 눈보다 길게 잘 뻗었어요. 형제, 친구 복이 좋고 주변에 도와주는 사람이 많은 상이에요.' },
    mid: { kw: ['원만한 관계'], text: '눈썹 길이도 눈하고 잘 어울려서 대인관계가 무난하게 흘러가요.' },
    low: { kw: ['독립형'], text: '눈썹이 짧은 편이라, 남 도움보다 자기 힘으로 이루는 독립형이에요. 혼자서도 잘하는 사람이에요.' },
  },
  eyeOpen: {
    high: { kw: ['감수성', '표현력'], text: '눈이 크고 시원해요. 감정 표현이 풍부하고 감수성이 좋아서 예술이나 사람 상대하는 일에 재능이 있어요.' },
    mid: { kw: ['균형 감각'], text: '눈매가 적당히 크고 안정적이에요. 감정하고 이성의 균형이 좋은 눈이에요.' },
    low: { kw: ['관찰력', '전략가'], text: '눈이 가늘고 길게 빠졌어요. 이런 눈은 속을 잘 안 드러내는 전략가의 눈이에요. 관찰력이 대단해요.' },
  },
  eyeTilt: {
    high: { kw: ['승부욕'], text: '눈꼬리가 살짝 올라갔어요. 승부욕 있고 목표 의식이 뚜렷해요. 일 욕심 있는 눈이에요.' },
    mid: { kw: [], text: '' },
    low: { kw: ['선한 인상'], text: '눈꼬리가 살짝 내려가서 인상이 순하고 선해 보여요. 사람들이 편하게 다가오는 복 있는 눈매예요.' },
  },
  eyeGap: {
    high: { kw: ['너그러움'], text: '양 눈 사이가 넓어서 마음이 너그럽고 느긋해요.' },
    mid: { kw: [], text: '' },
    low: { kw: ['집중력'], text: '눈 사이가 가까워서 집중력이 좋아요. 한 우물 파면 전문가 소리 듣습니다.' },
  },
  noseLen: {
    high: { kw: ['책임감'], text: '콧대가 길게 쭉 뻗었어요. 자존심 있고 책임감 강한 코예요. 중년에 자기 이름 걸고 일할 상이에요.' },
    mid: { kw: ['안정된 중년'], text: '코 길이가 얼굴하고 잘 맞아서 중년운이 안정적으로 흘러요.' },
    low: { kw: ['사교성'], text: '코가 아담해서 친근하고 사교적이에요. 혼자보다 여럿이서 일할 때 돈이 붙어요.' },
  },
  noseWidth: {
    high: { kw: ['재물 창고'], text: '콧방울이 두툼하게 잘 잡혔어요. 코는 재물 창고인데, 이런 코는 돈 모으는 힘이 좋아요. 재물운 합격입니다!' },
    mid: { kw: ['알뜰함'], text: '콧방울도 적당해서 들어오는 만큼 잘 관리하는 코예요.' },
    low: { kw: ['세련된 소비'], text: '콧방울이 날렵한 편이라 돈 쓰는 감각이 세련됐어요. 대신 새는 돈 조심! 통장을 쪼개서 관리하세요.' },
  },
  mouthWidth: {
    high: { kw: ['배포', '말의 힘'], text: '입이 시원하게 커요. 배포가 크고 말에 힘이 있어서 사람을 움직이는 재주가 있어요.' },
    mid: { kw: ['신뢰'], text: '입 크기가 균형 잡혀 있어서 말실수가 적고 신뢰를 받아요.' },
    low: { kw: ['신중함'], text: '입이 작고 단정해요. 말을 아끼는 신중한 타입이라 한마디 한마디에 무게가 있어요.' },
  },
  lipThick: {
    high: { kw: ['정', '식복'], text: '입술이 도톰해서 정이 많고 애정 표현도 잘해요. 먹을 복도 있어요.' },
    mid: { kw: [], text: '' },
    low: { kw: ['논리적'], text: '입술이 얇은 편이라 말이 논리적이고 깔끔해요. 협상 테이블에서 강한 입이에요.' },
  },
  mouthCurve: {
    high: { kw: ['복을 부르는 입'], text: '무엇보다 입꼬리가 올라가 있어요! 이게 최고의 관상이에요. 복은 웃는 얼굴로 들어옵니다.' },
    mid: { kw: [], text: '' },
    low: { kw: ['진중함'], text: '입꼬리가 살짝 내려가 있어요. 평소에 입꼬리 올리는 연습만 해도 인상이 확 바뀌고 운도 따라와요.' },
  },
  lower: {
    high: { kw: ['대기만성', '말년 복'], text: '하관이 길고 든든해요. 턱은 말년운하고 아랫사람 복을 보는데, 이런 턱은 나이 들수록 운이 좋아지는 대기만성형이에요.' },
    mid: { kw: ['편안한 말년'], text: '턱이 적당히 받쳐줘서 말년까지 무난하고 편안한 상이에요.' },
    low: { kw: ['젊은 운'], text: '턱이 짧고 갸름해요. 젊을 때 운이 강한 대신 말년 대비는 미리미리! 건강관리하고 저축 일찍 시작하면 끄떡없어요.' },
  },
  jawRatio: {
    high: { kw: ['추진력', '지구력'], text: '턱선이 넓어서 추진력하고 지구력이 있어요. 끝까지 버티는 힘이 있는 얼굴이에요.' },
    mid: { kw: [], text: '' },
    low: { kw: ['섬세함'], text: '턱선이 갸름해서 섬세하고 감각적이에요.' },
  },
};

// 첫인상에서 부를 이름: [양수일 때, 음수일 때]
const FEATURE_NAMES = {
  faceRatio: ['둥근 얼굴선', '길고 갸름한 얼굴선'],
  jawRatio: ['각진 턱선', '갸름한 턱선'],
  upper: ['훤한 이마', '아담한 이마'],
  eyeOpen: ['시원한 눈', '가늘고 긴 눈매'],
  eyeTilt: ['올라간 눈꼬리', '순한 눈꼬리'],
  browLen: ['길게 뻗은 눈썹', '짧고 단정한 눈썹'],
  noseLen: ['쭉 뻗은 콧대', '아담한 코'],
  noseWidth: ['두툼한 콧방울', '날렵한 코'],
  lipThick: ['도톰한 입술', '얇고 단정한 입술'],
  mouthCurve: ['올라간 입꼬리', '무게감 있는 입매'],
  lower: ['든든한 하관', '갸름한 하관'],
};

function combine(z, keys) {
  const texts = [];
  const kws = [];
  for (const k of keys) {
    const entry = T[k][levelOf(z[k])];
    if (entry.text) texts.push(entry.text);
    kws.push(...entry.kw);
  }
  return { text: texts.join(' '), keywords: [...new Set(kws)].slice(0, 4) };
}

function samjeongText(z) {
  const parts = [
    { key: 'upper', name: '이마 쪽 상정', era: '초년', gift: '공부 운과 부모 덕' },
    { key: 'middle', name: '눈썹부터 코까지 중정', era: '중년', gift: '사회 활동 운과 재물' },
    { key: 'lower', name: '코 밑부터 턱까지 하정', era: '말년', gift: '가정의 안정과 아랫사람 복' },
  ];
  const top = parts.reduce((a, b) => (z[b.key] > z[a.key] ? b : a));
  if (Math.max(...parts.map((p) => Math.abs(z[p.key]))) < 0.6) {
    return '삼정이 고르게 균형 잡혀 있어요. 관상에서 제일 좋게 치는 게 균형이에요. 초년, 중년, 말년 어느 한쪽 무너지지 않고 고르게 가는 인생이에요.';
  }
  return `삼정 중에서는 ${top.name}이 가장 발달했어요. ${top.era}에 ${top.gift}이 크게 들어오는 흐름이에요.`;
}

function scoreOf(base, parts) {
  const v = parts.reduce((s, [zv, w]) => s + clamp(zv, -2, 2) * w, base);
  return Math.round(clamp(v, 58, 97));
}

export function buildReading(m) {
  const z = {};
  for (const k of Object.keys(BASELINE)) {
    z[k] = clamp((m[k] - BASELINE[k].mean) / BASELINE[k].sd, -2.5, 2.5);
  }
  const typeKey = faceType(z);
  const type = TYPES[typeKey];
  const bonus = (map) => map[typeKey] ?? 0;

  const standout = Object.keys(FEATURE_NAMES)
    .sort((a, b) => Math.abs(z[b]) - Math.abs(z[a]))
    .slice(0, 2)
    .map((k) => FEATURE_NAMES[k][z[k] >= 0 ? 0 : 1]);

  const brows = combine(z, ['browGap', 'browLen']);
  const eyes = combine(z, ['eyeOpen', 'eyeTilt', 'eyeGap']);
  const nose = combine(z, ['noseLen', 'noseWidth']);
  const mouth = combine(z, ['mouthWidth', 'lipThick', 'mouthCurve']);
  const chin = combine(z, ['lower', 'jawRatio']);
  const forehead = combine(z, ['upper']);

  const scores = [
    { label: '재물운', value: scoreOf(72 + bonus({ earth: 6, metal: 3 }), [[z.noseWidth, 6], [z.lower, 3], [z.mouthWidth, 3]]) },
    { label: '연애운', value: scoreOf(72 + bonus({ water: 6, fire: 3 }), [[z.eyeOpen, 4], [z.lipThick, 4], [z.mouthCurve, 6]]) },
    { label: '직업·명예운', value: scoreOf(72 + bonus({ metal: 5, wood: 4 }), [[z.upper, 5], [z.browLen, 3], [z.eyeTilt, 3], [z.noseLen, 3]]) },
    { label: '건강·말년운', value: scoreOf(72 + bonus({ earth: 5, wood: 2 }), [[z.lower, 5], [z.jawRatio, 3], [z.chinLen, 3]]) },
  ];

  const sections = [
    {
      key: 'intro',
      short: '첫인상',
      title: '첫인상',
      region: 'all',
      keywords: standout,
      text: `자, 어디 봅시다... 허허, 얼굴 좋네요. 첫눈에 딱 들어오는 건 ${standout[0]}하고 ${ieyo(standout[1])}. 얼굴형부터 턱까지 하나씩 풀어드릴게요.`,
    },
    { key: 'face', short: '얼굴형', title: `얼굴형 · ${type.name}`, palace: '오행', region: 'face', keywords: type.keywords, text: type.text },
    { key: 'forehead', short: '이마', title: '이마', palace: '관록궁 · 초년운', region: 'forehead', ...forehead },
    { key: 'brows', short: '눈썹', title: '눈썹', palace: '보수관 · 형제와 대인관계', region: 'brows', ...brows },
    { key: 'eyes', short: '눈', title: '눈', palace: '감찰관 · 마음과 연애', region: 'eyes', ...eyes },
    { key: 'nose', short: '코', title: '코', palace: '재백궁 · 재물과 중년운', region: 'nose', ...nose },
    { key: 'mouth', short: '입', title: '입', palace: '출납관 · 말복과 식복', region: 'mouth', ...mouth },
    { key: 'chin', short: '턱', title: '턱', palace: '지각 · 말년운', region: 'chin', ...chin },
    {
      key: 'summary',
      short: '총평',
      title: '총평',
      palace: '삼정과 운세',
      region: 'samjeong',
      keywords: [type.name, `행운의 색 ${type.color.name}`, `행운의 방향 ${type.direction}`],
      text: `${samjeongText(z)} 한마디로 정리하면, "${type.motto}" 같은 상이에요. 행운의 색은 ${type.color.name}, 행운의 방향은 ${type.direction}이에요. 마지막으로 하나만 기억하세요. 관상은 마음먹기에 따라 바뀝니다. 잘 웃는 얼굴이 최고의 관상이에요!`,
    },
  ];

  return { metrics: m, z, type, scores, sections };
}
