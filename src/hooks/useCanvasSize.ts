import { DEFAULT_CANVAS_SIZE } from "@/constants/mapConfig";
import { useState, useEffect, RefObject } from "react";

interface UseCanvasSizeParams {
  canvasRef: RefObject<HTMLCanvasElement>;
}

/** 컨테이너 크기에 따른 캔버스 크기를 관리하는 훅 */
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
