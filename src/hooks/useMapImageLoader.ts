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
