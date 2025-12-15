import { useCallback, RefObject } from "react";
import { Vec2 } from "@/lib/jumpCalculator";
import { MAP_SIZE } from "@/constants/mapConfig";

interface UseMapCoordinatesParams {
  imageRef: RefObject<HTMLImageElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  zoom: number;
  pan: { x: number; y: number };
}

/**
 * Custom hook for coordinate transformation between screen and map space
 */
export function useMapCoordinates({
  imageRef,
  canvasRef,
  zoom,
  pan,
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
      const mapX = Math.max(
        0,
        Math.min(MAP_SIZE, (imgX / imgWidth) * MAP_SIZE)
      );
      const mapY = Math.max(
        0,
        Math.min(MAP_SIZE, MAP_SIZE - (imgY / imgHeight) * MAP_SIZE)
      );

      return { x: mapX, y: mapY };
    },
    [canvasRef, imageRef, zoom, pan]
  );

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
    [imageRef, zoom, pan]
  );

  return { screenToMap, mapToScreen };
}
