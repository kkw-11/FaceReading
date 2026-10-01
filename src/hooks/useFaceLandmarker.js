import { useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// package.json의 @mediapipe/tasks-vision 버전과 맞춰야 합니다
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

let loading = null;

function loadLandmarker() {
  if (!loading) {
    loading = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const options = (delegate) => ({
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      try {
        return await FaceLandmarker.createFromOptions(fileset, options('GPU'));
      } catch {
        return await FaceLandmarker.createFromOptions(fileset, options('CPU'));
      }
    })();
    loading.catch(() => {
      loading = null; // 실패하면 다음 마운트 때 재시도
    });
  }
  return loading;
}

// 앱 시작과 동시에 모델을 미리 받아둠 (한 번만 로드)
export function useFaceLandmarker() {
  const [state, setState] = useState({ landmarker: null, error: null });

  useEffect(() => {
    let alive = true;
    loadLandmarker().then(
      (landmarker) => alive && setState({ landmarker, error: null }),
      (error) => alive && setState({ landmarker: null, error }),
    );
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
