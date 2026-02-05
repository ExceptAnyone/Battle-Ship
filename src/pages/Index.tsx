import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { GameMap } from "@/components/GameMap";
import { MapSelector } from "@/components/MapSelector";
import { useMapSelection } from "@/hooks/useMapSelection";
import { usePlaneRoute } from "@/hooks/usePlaneRoute";
import { useJumpCalculation } from "@/hooks/useJumpCalculation";
import { useBooleanState } from "@/hooks/useBooleanState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const Index = () => {
  const { value: showMapSelector, toggle: toggleMapSelector } =
    useBooleanState(false);
  const { selectedMap, selectMap } = useMapSelection();
  const {
    planeStart,
    planeEnd,
    target,
    setPlaneStart,
    setPlaneEnd,
    setTarget,
    reset,
  } = usePlaneRoute();

  const { jumpDistance, jumpPoints } = useJumpCalculation({
    planeStart,
    planeEnd,
    target,
  });

  // Sentry 컨텍스트에 게임 상태 동기화
  useEffect(() => {
    const gamePhase = !planeStart
      ? "selectPlaneStart"
      : !planeEnd
        ? "selectPlaneEnd"
        : !target
          ? "selectTarget"
          : "complete";

    Sentry.setContext("gameState", {
      selectedMap: selectedMap.id,
      mapSize: selectedMap.size,
      gamePhase,
      hasPlaneStart: !!planeStart,
      hasPlaneEnd: !!planeEnd,
      hasTarget: !!target,
      jumpPointsCount: jumpPoints.length,
      jumpDistance,
    });

    Sentry.setTag("map", selectedMap.id);
    Sentry.setTag("gamePhase", gamePhase);
  }, [selectedMap, planeStart, planeEnd, target, jumpPoints, jumpDistance]);

  useKeyboardShortcuts({ r: reset });
  
  return (
    <div className="flex items-center justify-center h-screen w-screen overflow-hidden bg-background">
      {/* 맵 선택 토글 버튼 */}
      <button
        onClick={toggleMapSelector}
        className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {showMapSelector ? "맵 선택 닫기" : "맵 선택"}
      </button>

      {/* 맵 선택 드롭다운 */}
      {showMapSelector && (
        <div className="absolute top-16 left-4 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4">
          <MapSelector selectedMapId={selectedMap.id} onMapSelect={selectMap} />
        </div>
      )}

      {/* 맵 컨테이너 - 정확한 좌표 매핑을 위한 정사각형 비율 */}
      <div
        className="relative"
        style={{
          width: "min(100vh, 100vw)",
          height: "min(100vh, 100vw)",
          maxWidth: "100vw",
          maxHeight: "100vh",
        }}
      >
        <GameMap
          mapImage={selectedMap.image}
          mapSize={selectedMap.size}
          planeRoute={{ start: planeStart, end: planeEnd }}
          target={target}
          jumpDistance={jumpDistance}
          onPlaneStartSet={setPlaneStart}
          onPlaneEndSet={setPlaneEnd}
          onTargetSet={setTarget}
          jumpPoints={jumpPoints}
          onReset={reset}
        />
      </div>
    </div>
  );
};

export default Index;
