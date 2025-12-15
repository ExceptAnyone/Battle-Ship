import { useState, useEffect } from "react";
import { Vec2, JumpPoint, calcJumpPoints } from "@/lib/jumpCalculator";

const DEFAULT_JUMP_DISTANCE = 1250; // Default 1250m

interface UseJumpCalculationParams {
  planeStart: Vec2 | null;
  planeEnd: Vec2 | null;
  target: Vec2 | null;
}

/**
 * Custom hook for calculating jump points based on plane route and target
 */
export function useJumpCalculation({
  planeStart,
  planeEnd,
  target,
}: UseJumpCalculationParams) {
  const [jumpDistance, setJumpDistance] = useState(DEFAULT_JUMP_DISTANCE);
  const [jumpPoints, setJumpPoints] = useState<JumpPoint[]>([]);

  // Recalculate jump points whenever inputs change
  useEffect(() => {
    const hasAllRequiredData = planeStart && planeEnd && target;

    if (hasAllRequiredData) {
      const points = calcJumpPoints(planeStart, planeEnd, target, jumpDistance);
      setJumpPoints(points);
    } else {
      setJumpPoints([]);
    }
  }, [planeStart, planeEnd, target, jumpDistance]);

  return {
    jumpDistance,
    setJumpDistance,
    jumpPoints,
  };
}
