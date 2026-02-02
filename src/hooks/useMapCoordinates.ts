import { useCallback, RefObject } from "react";
import { Vec2 } from "@/lib/jumpCalculator";

interface UseMapCoordinatesParams {
  imageRef: RefObject<HTMLImageElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  zoom: number;
  pan: { x: number; y: number };
  mapSize: number;
}

/** 화면 좌표와 맵 좌표 간 변환을 처리하는 훅 */
export function useMapCoordinates({
  imageRef,
  canvasRef,
  zoom,
  pan,
  mapSize,
}: UseMapCoordinatesParams) {
  // 화면 좌표를 맵 좌표(0-4000 범위)로 변환
  const screenToMap = useCallback(
    (screenX: number, screenY: number): Vec2 => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || !imageRef.current) return { x: 0, y: 0 };

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // 화면 위치를 이미지 픽셀 위치로 변환
      const imgX = (screenX - rect.left - pan.x) / zoom;
      const imgY = (screenY - rect.top - pan.y) / zoom;

      // 이미지 픽셀 위치를 맵 좌표(0-4000 범위)로 변환
      const mapX = Math.max(0, Math.min(mapSize, (imgX / imgWidth) * mapSize));
      const mapY = Math.max(
        0,
        Math.min(mapSize, mapSize - (imgY / imgHeight) * mapSize)
      );

      return { x: mapX, y: mapY };
    },
    [canvasRef, imageRef, zoom, pan, mapSize]
  );

  // 맵 좌표를 화면 좌표로 변환
  const mapToScreen = useCallback(
    (mapPos: Vec2): { x: number; y: number } => {
      if (!imageRef.current) return { x: 0, y: 0 };

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // 맵 좌표(0-4000)를 이미지 픽셀 좌표로 변환
      const imgX = (mapPos.x / mapSize) * imgWidth;
      const imgY = ((mapSize - mapPos.y) / mapSize) * imgHeight;

      // 이미지 픽셀 좌표를 화면 좌표로 변환
      return {
        x: imgX * zoom + pan.x,
        y: imgY * zoom + pan.y,
      };
    },
    [imageRef, zoom, pan, mapSize]
  );

  return { screenToMap, mapToScreen };
}
