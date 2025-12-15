import { useRef, useEffect, useState, useCallback } from "react";
import { Vec2, JumpPoint } from "@/lib/jumpCalculator";
import sanhokMap from "@/assets/sanhok-map.webp";
import { useMapCoordinates } from "@/hooks/useMapCoordinates";
import {
  MAP_SIZE,
  MAP_PADDING_RATIO,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_WHEEL_STEP,
  ZOOM_BUTTON_STEP,
  DRAG_THRESHOLD_MS,
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
import { usePlaneRoute } from "@/hooks/usePlaneRoute";
import { useJumpCalculation } from "@/hooks/useJumpCalculation";

interface SanhokMapProps {
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

export function SanhokMap() {
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Use custom hook for coordinate transformation
  const { screenToMap, mapToScreen } = useMapCoordinates({
    imageRef,
    canvasRef,
    zoom,
    pan,
  });

  // Calculate zoom level to fit image in container
  const calculateFitZoom = useCallback(
    (
      containerWidth: number,
      containerHeight: number,
      imageWidth: number,
      imageHeight: number
    ) => {
      const zoomX = (containerWidth * MAP_PADDING_RATIO) / imageWidth;
      const zoomY = (containerHeight * MAP_PADDING_RATIO) / imageHeight;
      return Math.min(zoomX, zoomY);
    },
    []
  );

  // Calculate pan to center image in container
  const calculateCenterPan = useCallback(
    (
      containerWidth: number,
      containerHeight: number,
      imageWidth: number,
      imageHeight: number,
      zoom: number
    ) => ({
      x: (containerWidth - imageWidth * zoom) / 2,
      y: (containerHeight - imageHeight * zoom) / 2,
    }),
    []
  );

  // Load map image and calculate initial zoom/pan
  useEffect(() => {
    const img = new Image();
    img.src = sanhokMap;
    img.onload = () => {
      imageRef.current = img;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      setImageSize({ width: imgWidth, height: imgHeight });

      // Initialize zoom and pan to fit map in viewport
      const container = canvasRef.current?.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const fitZoom = calculateFitZoom(
          containerWidth,
          containerHeight,
          imgWidth,
          imgHeight
        );
        setZoom(fitZoom);

        const centerPan = calculateCenterPan(
          containerWidth,
          containerHeight,
          imgWidth,
          imgHeight,
          fitZoom
        );
        setPan(centerPan);
      }
    };
  }, [calculateFitZoom, calculateCenterPan]);

  // Update zoom and pan when container size changes (only if image is loaded)
  useEffect(() => {
    if (!imageRef.current || imageSize.width === 0 || imageSize.height === 0)
      return;

    const container = canvasRef.current?.parentElement;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const fitZoom = calculateFitZoom(
        containerWidth,
        containerHeight,
        imageSize.width,
        imageSize.height
      );
      setZoom(fitZoom);

      const centerPan = calculateCenterPan(
        containerWidth,
        containerHeight,
        imageSize.width,
        imageSize.height,
        fitZoom
      );
      setPan(centerPan);
    }
  }, [canvasSize, imageSize, calculateFitZoom, calculateCenterPan]);

  // Drawing helper functions
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
    [pan, zoom]
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
      const radiusInScreenPixels = (jumpDistance / MAP_SIZE) * imgWidth * zoom;

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
    [target, jumpDistance, zoom, mapToScreen]
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
  }, [
    planeStart,
    planeEnd,
    target,
    jumpDistance,
    jumpPoints,
    pan,
    zoom,
    draw,
    imageSize,
  ]);

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setCanvasSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore clicks that are actually drags
    const timeSinceMouseDown = Date.now() - dragStartTime;
    const isDragGesture = timeSinceMouseDown > DRAG_THRESHOLD_MS;
    if (isDragGesture) return;

    const pos = screenToMap(e.clientX, e.clientY);
    handleMapClick(pos);
  };

  const handleMapClick = (pos: Vec2) => {
    const isSelectingPlaneStart = !planeStart;
    const isSelectingPlaneEnd = planeStart && !planeEnd;
    const isSelectingTarget = planeStart && planeEnd;

    if (isSelectingPlaneStart) {
      setPlaneStart(pos);
    } else if (isSelectingPlaneEnd) {
      setPlaneEnd(pos);
    } else if (isSelectingTarget) {
      setTarget(pos);
    }
  };

  const resetMapView = useCallback(() => {
    const container = canvasRef.current?.parentElement;
    if (!container || !imageRef.current) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = imageRef.current.naturalWidth;
    const imgHeight = imageRef.current.naturalHeight;

    const fitZoom = calculateFitZoom(
      containerWidth,
      containerHeight,
      imgWidth,
      imgHeight
    );
    setZoom(fitZoom);

    const centerPan = calculateCenterPan(
      containerWidth,
      containerHeight,
      imgWidth,
      imgHeight,
      fitZoom
    );
    setPan(centerPan);

    reset();
  }, [calculateFitZoom, calculateCenterPan, reset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragStartTime(Date.now());
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;

    setPan((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 - ZOOM_WHEEL_STEP : 1 + ZOOM_WHEEL_STEP;
    setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta)));
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
          onClick={() =>
            setZoom((z) => Math.min(MAX_ZOOM, z * ZOOM_BUTTON_STEP))
          }
          className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <button
          onClick={() =>
            setZoom((z) => Math.max(MIN_ZOOM, z / ZOOM_BUTTON_STEP))
          }
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
