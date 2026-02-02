import { Vec2 } from "@/lib/jumpCalculator";

type GamePhase =
  | "selectPlaneStart"
  | "selectPlaneEnd"
  | "selectTarget"
  | "complete";

const PHASE_MESSAGES: Partial<Record<GamePhase, string>> = {
  selectPlaneStart: "비행기 경로를 선택해주세요.",
  selectPlaneEnd: "비행기 경로를 선택해주세요.",
  selectTarget: "도착지점을 선택해주세요.",
};

function getGamePhase(
  planeStart: Vec2 | null,
  planeEnd: Vec2 | null,
  target: Vec2 | null
): GamePhase {
  if (!planeStart) return "selectPlaneStart";
  if (!planeEnd) return "selectPlaneEnd";
  if (!target) return "selectTarget";
  return "complete";
}

interface InstructionOverlayProps {
  planeStart: Vec2 | null;
  planeEnd: Vec2 | null;
  target: Vec2 | null;
}

export function InstructionOverlay({
  planeStart,
  planeEnd,
  target,
}: InstructionOverlayProps) {
  const phase = getGamePhase(planeStart, planeEnd, target);
  const message = PHASE_MESSAGES[phase];

  if (!message) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border px-20 py-3 rounded-lg shadow-lg z-10">
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}
