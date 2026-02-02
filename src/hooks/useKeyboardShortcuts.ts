import { useEffect, useRef } from 'react';

/**
 * 키보드 단축키를 등록하는 훅
 *
 * @param shortcuts - 키 이름과 콜백 함수의 매핑
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   r: reset,
 *   Escape: closeModal,
 *   's': save
 * });
 * ```
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  // useRef를 사용하여 shortcuts가 변경될 때마다 리스너를 재등록하지 않도록 최적화
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    // 항상 최신 shortcuts 참조를 유지
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const callback = shortcutsRef.current[e.key];

      // 단축키가 정의되어 있을 때만 실행
      if (callback) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // 빈 의존성 배열로 마운트/언마운트 시에만 실행
}
