import { useState, useCallback } from "react";
import { useBooleanState } from "./useBooleanState";
import { DRAG_THRESHOLD_MS } from "@/constants/mapConfig";

/**
 * Custom hook for managing map drag interactions
 */
export function useMapDrag() {
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
    (e: React.MouseEvent, onPanChange: (dx: number, dy: number) => void) => {
      if (!isDragging) return;

      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;

      onPanChange(dx, dy);
      setLastMouse({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastMouse]
  );

  const handleMouseUp = useCallback(() => {
    stopDragging();
  }, [stopDragging]);

  const isDragGesture = useCallback(() => {
    const timeSinceMouseDown = Date.now() - dragStartTime;
    return timeSinceMouseDown > DRAG_THRESHOLD_MS;
  }, [dragStartTime]);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragGesture,
  };
}
