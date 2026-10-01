// MediaPipe Face Landmarker(478점) 인덱스
// R = 본인 기준 오른쪽(화면 왼쪽), L = 본인 기준 왼쪽(화면 오른쪽)
export const IDX = {
  foreheadTop: 10,
  chin: 152,
  noseBridge: 168,
  noseTip: 1,
  subnasale: 2,
  cheekR: 234,
  cheekL: 454,
  jawR: 172,
  jawL: 397,
  foreheadR: 54,
  foreheadL: 284,

  eyeROuter: 33,
  eyeRInner: 133,
  eyeRTop: 159,
  eyeRBottom: 145,
  eyeLOuter: 263,
  eyeLInner: 362,
  eyeLTop: 386,
  eyeLBottom: 374,

  browRInner: 107,
  browRPeak: 105,
  browROuter: 46,
  browLInner: 336,
  browLPeak: 334,
  browLOuter: 276,

  noseWingR: 129,
  noseWingL: 358,

  mouthR: 61,
  mouthL: 291,
  upperLipTop: 0,
  upperLipBottom: 13,
  lowerLipTop: 14,
  lowerLipBottom: 17,
};

const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];
const FOREHEAD = [
  54, 103, 67, 109, 10, 338, 297, 332, 284, 300, 293, 334, 296, 336, 9, 107, 66, 105, 63, 70,
];
const RIGHT_EYE = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
const LEFT_EYE = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
const LIPS_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
];
const CHIN = [
  58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 291, 17, 61,
];

// 결과 화면에서 강조할 부위
export const REGIONS = {
  face: { label: '얼굴형', polys: [FACE_OVAL] },
  forehead: { label: '이마 · 관록궁', polys: [FOREHEAD] },
  brows: {
    label: '눈썹 · 보수관',
    lines: [
      [70, 63, 105, 66, 107],
      [336, 296, 334, 293, 300],
    ],
  },
  eyes: { label: '눈 · 감찰관', polys: [RIGHT_EYE, LEFT_EYE] },
  nose: {
    label: '코 · 재백궁',
    lines: [
      [168, 6, 197, 195, 5, 4, 1],
      [129, 98, 97, 2, 326, 327, 358],
    ],
  },
  mouth: { label: '입 · 출납관', polys: [LIPS_OUTER] },
  chin: { label: '턱 · 지각', polys: [CHIN] },
};
