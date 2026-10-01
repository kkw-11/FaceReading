import { useEffect, useState } from 'react';

export function useTypewriter(text, speed = 38) {
  const [state, setState] = useState({ text, count: 0 });

  // 대사가 바뀌면 렌더링 중에 바로 0부터 다시 (이전 글자 수가 번쩍 보이지 않게)
  let { count } = state;
  if (state.text !== text) {
    count = 0;
    setState({ text, count: 0 });
  }

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        if (s.count >= s.text.length) {
          clearInterval(id);
          return s;
        }
        return { ...s, count: s.count + 1 };
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    skip: () => setState({ text, count: text.length }),
  };
}
