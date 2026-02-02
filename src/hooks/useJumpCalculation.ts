import { useState, useEffect } from "react";
import { Vec2, JumpPoint, calcJumpPoints } from "@/lib/jumpCalculator";
import { DEFAULT_JUMP_DISTANCE } from "@/constants/mapConfig";

interface UseJumpCalculationParams {
  planeStart: Vec2 | null;
  planeEnd: Vec2 | null;
  target: Vec2 | null;
}

/** 비행기 경로와 목표 지점 기반으로 점프 포인트를 계산하는 훅 */
export function useJumpCalculation({
  planeStart,
  planeEnd,
  target,
}: UseJumpCalculationParams) {
  const [jumpDistance, setJumpDistance] = useState(DEFAULT_JUMP_DISTANCE);
  const [jumpPoints, setJumpPoints] = useState<JumpPoint[]>([]);

  // 입력값 변경 시 점프 포인트 재계산
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
