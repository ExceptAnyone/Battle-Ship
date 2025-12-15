import { useState, useCallback, useRef, useEffect } from "react";
import {
  MAP_PADDING_RATIO,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_WHEEL_STEP,
  ZOOM_BUTTON_STEP,
} from "@/constants/mapConfig";

interface Size {
  width: number;
  height: number;
}

interface UseMapZoomPanParams {
  canvasSize: Size;
  imageSize: Size;
}

/**
 * Custom hook for managing map zoom and pan state
 */
export function useMapZoomPan({ canvasSize, imageSize }: UseMapZoomPanParams) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

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

  // Update zoom and pan when container or image size changes
  useEffect(() => {
    if (imageSize.width === 0 || imageSize.height === 0) return;

    const fitZoom = calculateFitZoom(
      canvasSize.width,
      canvasSize.height,
      imageSize.width,
      imageSize.height
    );
    setZoom(fitZoom);

    const centerPan = calculateCenterPan(
      canvasSize.width,
      canvasSize.height,
      imageSize.width,
      imageSize.height,
      fitZoom
    );
    setPan(centerPan);
  }, [canvasSize, imageSize, calculateFitZoom, calculateCenterPan]);

  const resetView = useCallback(() => {
    if (imageSize.width === 0 || imageSize.height === 0) return;

    const fitZoom = calculateFitZoom(
      canvasSize.width,
      canvasSize.height,
      imageSize.width,
      imageSize.height
    );
    setZoom(fitZoom);

    const centerPan = calculateCenterPan(
      canvasSize.width,
      canvasSize.height,
      imageSize.width,
      imageSize.height,
      fitZoom
    );
    setPan(centerPan);
  }, [canvasSize, imageSize, calculateFitZoom, calculateCenterPan]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z * ZOOM_BUTTON_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z / ZOOM_BUTTON_STEP));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 - ZOOM_WHEEL_STEP : 1 + ZOOM_WHEEL_STEP;
    setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta)));
  }, []);

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    resetView,
    zoomIn,
    zoomOut,
    handleWheel,
  };
}
