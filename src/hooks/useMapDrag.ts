import { useState, useCallback } from "react";
import { useBooleanState } from "./useBooleanState";
import { DRAG_THRESHOLD_MS } from "@/constants/mapConfig";

interface UseMapDragParams {
  onPanChange: (dx: number, dy: number) => void;
}

/** 맵 드래그 인터랙션을 관리하는 훅 */
export function useMapDrag({ onPanChange }: UseMapDragParams) {
  const {
    value: isDragging,
    setTrue: startDragging,
    setFalse: stopDragging,
  } = useBooleanState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragStartTime(Date.now());
      startDragging();
      setLastMouse({ x: e.clientX, y: e.clientY });
    },
    [startDragging]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;

      onPanChange(dx, dy);
      setLastMouse({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastMouse, onPanChange]
  );

  const handleMouseUp = useCallback(() => {
    stopDragging();
  }, [stopDragging]);

  const isDragGesture = useCallback(() => {
    const timeSinceMouseDown = Date.now() - dragStartTime;
    return timeSinceMouseDown > DRAG_THRESHOLD_MS;
  }, [dragStartTime]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragGesture,
  };
}
