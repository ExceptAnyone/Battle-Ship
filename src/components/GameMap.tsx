import { useRef, useEffect, useCallback } from "react";
import { Vec2, JumpPoint } from "@/lib/jumpCalculator";
import {
  drawPlanePath,
  drawTargetCircle,
  drawPlaneMarkers,
  drawJumpPoints as drawJumpPointsFn,
} from "@/lib/canvasDrawers";
import { useMapCoordinates } from "@/hooks/useMapCoordinates";
import { useCanvasSize } from "@/hooks/useCanvasSize";
import { useMapZoomPan } from "@/hooks/useMapZoomPan";
import { useMapDrag } from "@/hooks/useMapDrag";
import { useMapImageLoader } from "@/hooks/useMapImageLoader";
import { InstructionOverlay } from "@/components/InstructionOverlay";
import { ZoomControls } from "@/components/ZoomControls";

export interface PlaneRoute {
  start: Vec2 | null;
  end: Vec2 | null;
}

interface GameMapProps {
  mapImage: string;
  mapSize: number;
  planeRoute: PlaneRoute;
  target: Vec2 | null;
  jumpDistance: number;
  onPlaneStartSet: (pos: Vec2) => void;
  onPlaneEndSet: (pos: Vec2) => void;
  onTargetSet: (pos: Vec2) => void;
  jumpPoints: JumpPoint[];
  onReset: () => void;
}

export function GameMap({
  mapImage,
  mapSize,
  planeRoute,
  target,
  jumpDistance,
  onPlaneStartSet,
  onPlaneEndSet,
  onTargetSet,
  jumpPoints,
  onReset,
}: GameMapProps) {
  const { start: planeStart, end: planeEnd } = planeRoute;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasSize = useCanvasSize({ canvasRef });
  const { imageRef, imageSize } = useMapImageLoader({
    mapImage,
    canvasRef,
    canvasSize,
  });
  const { pan, setPan, zoom, resetView, zoomIn, zoomOut, handleWheel } =
    useMapZoomPan({ canvasSize, imageSize });

  const handlePanChange = useCallback(
    (dx: number, dy: number) => {
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [setPan]
  );

  const { handleMouseDown, handleMouseMove, handleMouseUp, isDragGesture } =
    useMapDrag({ onPanChange: handlePanChange });

  const { screenToMap, mapToScreen } = useMapCoordinates({
    imageRef,
    canvasRef,
    zoom,
    pan,
    mapSize,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // 맵 이미지 렌더링
    if (imageRef.current) {
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;
      ctx.drawImage(imageRef.current, pan.x, pan.y, imgWidth * zoom, imgHeight * zoom);
    }

    // 비행기 경로
    if (planeStart && planeEnd) {
      drawPlanePath(ctx, mapToScreen(planeStart), mapToScreen(planeEnd));
    }

    // 목표 반경 원
    if (target && imageRef.current) {
      const imgWidth = imageRef.current.naturalWidth;
      const radiusInScreenPixels = (jumpDistance / mapSize) * imgWidth * zoom;
      drawTargetCircle(ctx, mapToScreen(target), radiusInScreenPixels);
    }

    // 비행기 시작/끝 마커
    drawPlaneMarkers(
      ctx,
      planeStart ? mapToScreen(planeStart) : null,
      planeEnd ? mapToScreen(planeEnd) : null
    );

    // 점프 포인트
    drawJumpPointsFn(
      ctx,
      jumpPoints.map((jp) => ({
        screen: mapToScreen(jp.position),
        isRecommended: jp.isRecommended,
      }))
    );

    ctx.restore();
  }, [pan, zoom, imageRef, planeStart, planeEnd, target, jumpDistance, mapSize, mapToScreen, jumpPoints]);

  useEffect(() => {
    if (imageRef.current) {
      draw();
    }
  }, [draw, imageSize, imageRef]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 드래그 제스처인 경우 클릭 무시
    if (isDragGesture()) return;

    const pos = screenToMap(e.clientX, e.clientY);
    handleMapClick(pos);
  };

  const handleMapClick = (pos: Vec2) => {
    const isSelectingPlaneStart = !planeStart;
    const isSelectingPlaneEnd = planeStart && !planeEnd;
    const isSelectingTarget = planeStart && planeEnd;

    if (isSelectingPlaneStart) {
      onPlaneStartSet(pos);
    } else if (isSelectingPlaneEnd) {
      onPlaneEndSet(pos);
    } else if (isSelectingTarget) {
      onTargetSet(pos);
    }
  };

  const resetMapView = useCallback(() => {
    resetView();
    onReset();
  }, [resetView, onReset]);

  return (
    <div className="relative w-full h-full bg-muted">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full cursor-crosshair"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      <InstructionOverlay
        planeStart={planeStart}
        planeEnd={planeEnd}
        target={target}
      />

      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetMapView} />
    </div>
  );
}
