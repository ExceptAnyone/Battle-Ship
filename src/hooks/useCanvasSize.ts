import { DEFAULT_CANVAS_SIZE } from "@/constants/mapConfig";
import { useState, useEffect, RefObject } from "react";

interface UseCanvasSizeParams {
  canvasRef: RefObject<HTMLCanvasElement>;
}

/**
 * Custom hook for managing canvas size based on container dimensions
 */
export function useCanvasSize({ canvasRef }: UseCanvasSizeParams) {
  const [canvasSize, setCanvasSize] = useState({
    width: DEFAULT_CANVAS_SIZE,
    height: DEFAULT_CANVAS_SIZE,
  });

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
  }, [canvasRef]);

  return canvasSize;
}
