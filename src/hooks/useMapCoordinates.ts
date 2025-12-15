import { useCallback, RefObject } from "react";
import { Vec2 } from "@/lib/jumpCalculator";

interface UseMapCoordinatesParams {
  imageRef: RefObject<HTMLImageElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  zoom: number;
  pan: { x: number; y: number };
  mapSize: number;
}

/**
 * Custom hook for coordinate transformation between screen and map space
 */
export function useMapCoordinates({
  imageRef,
  canvasRef,
  zoom,
  pan,
  mapSize,
}: UseMapCoordinatesParams) {
  // Convert screen coordinates to map coordinates (0-4000 range)
  const screenToMap = useCallback(
    (screenX: number, screenY: number): Vec2 => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || !imageRef.current) return { x: 0, y: 0 };

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // Convert screen position to image pixel position
      const imgX = (screenX - rect.left - pan.x) / zoom;
      const imgY = (screenY - rect.top - pan.y) / zoom;

      // Convert image pixel position to map coordinates (0-4000 range)
      const mapX = Math.max(0, Math.min(mapSize, (imgX / imgWidth) * mapSize));
      const mapY = Math.max(
        0,
        Math.min(mapSize, mapSize - (imgY / imgHeight) * mapSize)
      );

      return { x: mapX, y: mapY };
    },
    [canvasRef, imageRef, zoom, pan, mapSize]
  );

  // Convert map coordinates to screen coordinates
  const mapToScreen = useCallback(
    (mapPos: Vec2): { x: number; y: number } => {
      if (!imageRef.current) return { x: 0, y: 0 };

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // Convert map coordinates (0-4000) to image pixel coordinates
      const imgX = (mapPos.x / mapSize) * imgWidth;
      const imgY = ((mapSize - mapPos.y) / mapSize) * imgHeight;

      // Convert image pixel coordinates to screen coordinates
      return {
        x: imgX * zoom + pan.x,
        y: imgY * zoom + pan.y,
      };
    },
    [imageRef, zoom, pan, mapSize]
  );

  return { screenToMap, mapToScreen };
}
