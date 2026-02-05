import * as Sentry from "@sentry/react";
import { useRef, useState, useEffect, RefObject } from "react";

interface UseMapImageLoaderParams {
  mapImage: string;
  canvasRef: RefObject<HTMLCanvasElement>;
  canvasSize: { width: number; height: number };
  onImageLoad?: (
    imageRef: HTMLImageElement,
    size: { width: number; height: number }
  ) => void;
}

/** 맵 이미지를 로드하고 이미지 상태를 관리하는 훅 */
export function useMapImageLoader({
  mapImage,
  onImageLoad,
}: UseMapImageLoaderParams) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imageRef.current = img;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const size = { width: imgWidth, height: imgHeight };
      setImageSize(size);
      setImageError(null);

      if (onImageLoad) {
        onImageLoad(img, size);
      }
    };

    img.onerror = () => {
      const errorMessage = `맵 이미지 로드 실패: ${mapImage}`;
      setImageError(errorMessage);

      Sentry.captureException(new Error(errorMessage), {
        tags: { feature: "mapImageLoad" },
        extra: {
          mapImage,
          onLine: navigator.onLine,
        },
      });
    };
  }, [mapImage, onImageLoad]);

  return {
    imageRef,
    imageSize,
    imageError,
  };
}
