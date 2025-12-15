import { useState, useCallback } from "react";
import { Vec2 } from "@/lib/jumpCalculator";

export function usePlaneRoute() {
  const [planeStart, setPlaneStart] = useState<Vec2 | null>(null);
  const [planeEnd, setPlaneEnd] = useState<Vec2 | null>(null);
  const [target, setTarget] = useState<Vec2 | null>(null);

  const reset = useCallback(() => {
    setPlaneStart(null);
    setPlaneEnd(null);
    setTarget(null);
  }, []);

  return {
    planeStart,
    planeEnd,
    target,
    setPlaneStart,
    setPlaneEnd,
    setTarget,
    reset,
  };
}
