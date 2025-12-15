import { useRef, useEffect, useCallback } from "react";
import { Vec2, JumpPoint } from "@/lib/jumpCalculator";
import { useMapCoordinates } from "@/hooks/useMapCoordinates";
import { useCanvasSize } from "@/hooks/useCanvasSize";
import { useMapZoomPan } from "@/hooks/useMapZoomPan";
import { useMapDrag } from "@/hooks/useMapDrag";
import { useMapImageLoader } from "@/hooks/useMapImageLoader";
import {
  PLANE_PATH_COLOR,
  PLANE_PATH_LINE_WIDTH,
  PLANE_PATH_DASH_PATTERN,
  TARGET_CIRCLE_COLOR,
  TARGET_CIRCLE_FILL_COLOR,
  TARGET_CIRCLE_LINE_WIDTH,
  JUMP_POINT_COLOR,
  MARKER_BORDER_COLOR,
  MARKER_BORDER_WIDTH,
  MARKER_SIZE_DEFAULT,
  MARKER_SIZE_RECOMMENDED,
  JUMP_LABEL_OFFSET,
} from "@/constants/mapConfig";

interface GameMapProps {
  mapImage: string;
  mapSize: number;
  planeStart: Vec2 | null;
  planeEnd: Vec2 | null;
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
  planeStart,
  planeEnd,
  target,
  jumpDistance,
  onPlaneStartSet,
  onPlaneEndSet,
  onTargetSet,
  jumpPoints,
  onReset,
}: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasSize = useCanvasSize({ canvasRef });
  const { imageRef, imageSize } = useMapImageLoader({
    mapImage,
    canvasRef,
    canvasSize,
  });
  const { pan, setPan, zoom, resetView, zoomIn, zoomOut, handleWheel } =
    useMapZoomPan({ canvasSize, imageSize });
  const {
    handleMouseDown: onMouseDown,
    handleMouseMove: onMouseMove,
    handleMouseUp: onMouseUp,
    isDragGesture,
  } = useMapDrag();

  const { screenToMap, mapToScreen } = useMapCoordinates({
    imageRef,
    canvasRef,
    zoom,
    pan,
    mapSize,
  });

  const drawMarker = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    size: number
  ) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = MARKER_BORDER_COLOR;
    ctx.lineWidth = MARKER_BORDER_WIDTH;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const drawMapImage = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!imageRef.current) return;

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;
      ctx.drawImage(
        imageRef.current,
        pan.x,
        pan.y,
        imgWidth * zoom,
        imgHeight * zoom
      );
    },
    [pan, zoom, imageRef]
  );

  const drawPlanePath = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!planeStart || !planeEnd) return;

      const start = mapToScreen(planeStart);
      const end = mapToScreen(planeEnd);

      ctx.strokeStyle = PLANE_PATH_COLOR;
      ctx.lineWidth = PLANE_PATH_LINE_WIDTH;
      ctx.setLineDash(PLANE_PATH_DASH_PATTERN);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    [planeStart, planeEnd, mapToScreen]
  );

  const drawTargetCircle = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!target || !imageRef.current) return;

      const targetScreen = mapToScreen(target);
      const imgWidth = imageRef.current.naturalWidth;
      const radiusInScreenPixels = (jumpDistance / mapSize) * imgWidth * zoom;

      // Draw radius circle
      ctx.strokeStyle = TARGET_CIRCLE_COLOR;
      ctx.fillStyle = TARGET_CIRCLE_FILL_COLOR;
      ctx.lineWidth = TARGET_CIRCLE_LINE_WIDTH;
      ctx.beginPath();
      ctx.arc(
        targetScreen.x,
        targetScreen.y,
        radiusInScreenPixels,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();

      // Draw target marker
      drawMarker(
        ctx,
        targetScreen.x,
        targetScreen.y,
        TARGET_CIRCLE_COLOR,
        MARKER_SIZE_DEFAULT
      );
    },
    [target, jumpDistance, zoom, mapSize, mapToScreen, imageRef]
  );

  const drawPlaneMarkers = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (planeStart) {
        const start = mapToScreen(planeStart);
        drawMarker(
          ctx,
          start.x,
          start.y,
          PLANE_PATH_COLOR,
          MARKER_SIZE_DEFAULT
        );
      }
      if (planeEnd) {
        const end = mapToScreen(planeEnd);
        drawMarker(ctx, end.x, end.y, PLANE_PATH_COLOR, MARKER_SIZE_DEFAULT);
      }
    },
    [planeStart, planeEnd, mapToScreen]
  );

  const drawJumpPoints = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      jumpPoints.forEach((jp) => {
        const pos = mapToScreen(jp.position);
        drawMarker(
          ctx,
          pos.x,
          pos.y,
          JUMP_POINT_COLOR,
          jp.isRecommended ? MARKER_SIZE_RECOMMENDED : MARKER_SIZE_DEFAULT
        );

        if (jp.isRecommended) {
          // Draw "JUMP HERE" label
          ctx.fillStyle = JUMP_POINT_COLOR;
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("JUMP HERE", pos.x, pos.y - JUMP_LABEL_OFFSET);
        }
      });
    },
    [jumpPoints, mapToScreen]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    drawMapImage(ctx);
    drawPlanePath(ctx);
    drawTargetCircle(ctx);
    drawPlaneMarkers(ctx);
    drawJumpPoints(ctx);

    ctx.restore();
  }, [
    drawMapImage,
    drawPlanePath,
    drawTargetCircle,
    drawPlaneMarkers,
    drawJumpPoints,
  ]);

  useEffect(() => {
    if (imageRef.current) {
      draw();
    }
  }, [draw, imageSize, imageRef]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore clicks that are actually drags
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    onMouseDown(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    onMouseMove(e, (dx, dy) => {
      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    });
  };

  const handleMouseUp = () => {
    onMouseUp();
  };

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

      {/* Instruction overlay */}
      {(!planeStart || (planeStart && !planeEnd)) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border px-20 py-3 rounded-lg shadow-lg z-10">
          <p className="text-lg font-medium">비행기 경로를 선택해주세요.</p>
        </div>
      )}
      {planeStart && planeEnd && !target && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border px-20 py-3 rounded-lg shadow-lg z-10">
          <p className="text-lg font-medium">도착지점을 선택해주세요.</p>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <button
          onClick={zoomOut}
          className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
        >
          <span className="text-xl font-bold">−</span>
        </button>
        <button
          onClick={resetMapView}
          className="bg-card/95 border border-border px-2 py-2 rounded hover:bg-accent text-xs font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
