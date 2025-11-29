import { useRef, useEffect, useState, useCallback } from 'react';
import { Vec2, JumpPoint } from '@/lib/jumpCalculator';
import sanhokMap from '@/assets/sanhok-map.webp';

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

const MAP_SIZE = 4000; // Map is 4000x4000 meters

export function SanhokMap({
  planeStart,
  planeEnd,
  target,
  jumpDistance,
  onPlaneStartSet,
  onPlaneEndSet,
  onTargetSet,
  jumpPoints,
  onReset,
}: SanhokMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

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

        // Calculate zoom to fit image in container with some padding
        const zoomX = (containerWidth * 0.95) / imgWidth;
        const zoomY = (containerHeight * 0.95) / imgHeight;
        const fitZoom = Math.min(zoomX, zoomY);

        setZoom(fitZoom);

        // Center the map
        setPan({
          x: (containerWidth - imgWidth * fitZoom) / 2,
          y: (containerHeight - imgHeight * fitZoom) / 2,
        });
      }
    };
  }, []);

  // Update zoom and pan when container size changes (only if image is loaded)
  useEffect(() => {
    if (!imageRef.current || imageSize.width === 0 || imageSize.height === 0)
      return;

    const container = canvasRef.current?.parentElement;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate zoom to fit image in container with some padding
      const zoomX = (containerWidth * 0.95) / imageSize.width;
      const zoomY = (containerHeight * 0.95) / imageSize.height;
      const fitZoom = Math.min(zoomX, zoomY);

      setZoom(fitZoom);

      // Center the map
      setPan({
        x: (containerWidth - imageSize.width * fitZoom) / 2,
        y: (containerHeight - imageSize.height * fitZoom) / 2,
      });
    }
  }, [canvasSize, imageSize]);

  // Convert screen coordinates to map coordinates
  const screenToMap = (screenX: number, screenY: number): Vec2 => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !imageRef.current) return { x: 0, y: 0 };

    const imgWidth = imageRef.current.naturalWidth;
    const imgHeight = imageRef.current.naturalHeight;

    // Convert screen position to image pixel position
    const imgX = (screenX - rect.left - pan.x) / zoom;
    const imgY = (screenY - rect.top - pan.y) / zoom;

    // Convert image pixel position to map coordinates (0-4000 range)
    const mapX = Math.max(0, Math.min(MAP_SIZE, (imgX / imgWidth) * MAP_SIZE));
    const mapY = Math.max(
      0,
      Math.min(MAP_SIZE, MAP_SIZE - (imgY / imgHeight) * MAP_SIZE)
    );

    return { x: mapX, y: mapY };
  };

  // Convert map coordinates to screen coordinates
  const mapToScreen = useCallback(
    (mapPos: Vec2): { x: number; y: number } => {
      if (!imageRef.current) return { x: 0, y: 0 };

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // Convert map coordinates (0-4000) to image pixel coordinates
      const imgX = (mapPos.x / MAP_SIZE) * imgWidth;
      const imgY = ((MAP_SIZE - mapPos.y) / MAP_SIZE) * imgHeight;

      // Convert image pixel coordinates to screen coordinates
      return {
        x: imgX * zoom + pan.x,
        y: imgY * zoom + pan.y,
      };
    },
    [zoom, pan]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Draw map image
    if (imageRef.current) {
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;
      ctx.drawImage(
        imageRef.current,
        pan.x,
        pan.y,
        imgWidth * zoom,
        imgHeight * zoom
      );
    }

    // Draw plane path
    if (planeStart && planeEnd) {
      const start = mapToScreen(planeStart);
      const end = mapToScreen(planeEnd);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (target) {
      const targetScreen = mapToScreen(target);

      let radiusInScreenPixels = 0;
      if (imageRef.current) {
        const imgWidth = imageRef.current.naturalWidth;

        radiusInScreenPixels = (jumpDistance / MAP_SIZE) * imgWidth * zoom;
      }

      // Draw radius circle
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.lineWidth = 2;
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
      drawMarker(ctx, targetScreen.x, targetScreen.y, '#ef4444', 8);
    }

    // Draw plane start/end markers
    if (planeStart) {
      const start = mapToScreen(planeStart);
      drawMarker(ctx, start.x, start.y, '#3b82f6', 8);
    }
    if (planeEnd) {
      const end = mapToScreen(planeEnd);
      drawMarker(ctx, end.x, end.y, '#3b82f6', 8);
    }

    // Draw jump points
    jumpPoints.forEach((jp) => {
      const pos = mapToScreen(jp.position);
      drawMarker(ctx, pos.x, pos.y, '#f97316', jp.isRecommended ? 12 : 8);

      if (jp.isRecommended) {
        // Draw "JUMP HERE" label
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('JUMP HERE', pos.x, pos.y - 20);
      }
    });

    ctx.restore();
  }, [
    planeStart,
    planeEnd,
    target,
    jumpDistance,
    jumpPoints,
    pan,
    zoom,
    mapToScreen,
  ]);

  const drawMarker = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    size: number
  ) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore clicks that are actually drags
    const timeSinceMouseDown = Date.now() - dragStartTime;
    if (timeSinceMouseDown > 200) return;

    const pos = screenToMap(e.clientX, e.clientY);

    if (!planeStart) {
      onPlaneStartSet(pos);
    } else if (!planeEnd) {
      onPlaneEndSet(pos);
    } else {
      onTargetSet(pos);
    }
  };

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
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
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
          onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
          className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z / 1.2))}
          className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
        >
          <span className="text-xl font-bold">−</span>
        </button>
        <button
          onClick={() => {
            const container = canvasRef.current?.parentElement;
            if (container && imageRef.current) {
              const containerWidth = container.clientWidth;
              const containerHeight = container.clientHeight;
              const imgWidth = imageRef.current.naturalWidth;
              const imgHeight = imageRef.current.naturalHeight;
              const zoomX = (containerWidth * 0.95) / imgWidth;
              const zoomY = (containerHeight * 0.95) / imgHeight;
              const fitZoom = Math.min(zoomX, zoomY);
              setZoom(fitZoom);
              setPan({
                x: (containerWidth - imgWidth * fitZoom) / 2,
                y: (containerHeight - imgHeight * fitZoom) / 2,
              });
            }
            onReset();
          }}
          className="bg-card/95 border border-border px-2 py-2 rounded hover:bg-accent text-xs font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
