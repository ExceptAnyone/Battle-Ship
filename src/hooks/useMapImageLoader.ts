import { useRef, useState, useEffect, useCallback, RefObject } from "react";

interface UseMapImageLoaderParams {
  mapImage: string;
  canvasRef: RefObject<HTMLCanvasElement>;
  canvasSize: { width: number; height: number };
  onImageLoad?: (
    imageRef: HTMLImageElement,
    size: { width: number; height: number }
  ) => void;
}

/**
 * Custom hook for loading map images and managing image state
 */
export function useMapImageLoader({
  mapImage,
  canvasRef,
  canvasSize,
  onImageLoad,
}: UseMapImageLoaderParams) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imageRef.current = img;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const size = { width: imgWidth, height: imgHeight };
      setImageSize(size);

      if (onImageLoad) {
        onImageLoad(img, size);
      }
    };
  }, [mapImage, onImageLoad]);

  return {
    imageRef,
    imageSize,
  };
}
