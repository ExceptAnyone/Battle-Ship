import sanhokMapImage from "@/assets/sanhok-map.webp";
import erangelMapImage from "@/assets/에란겔.webp";
import taegoMapImage from "@/assets/태이고.webp";
import miramarMapImage from "@/assets/미라마.webp";

/** 맵 설정 인터페이스 */
export interface MapConfig {
  id: MapNames;
  name: string;
  displayName: string;
  image: string;
  size: number; // 맵 크기 (미터 단위, 예: 4000x4000, 8000x8000)
}

type MapNames = "sanhok" | "erangel" | "taego" | "miramar";

/** 사용 가능한 맵 설정 */
export const MAPS: Record<MapNames, MapConfig> = {
  sanhok: {
    id: "sanhok",
    name: "sanhok",
    displayName: "사녹",
    image: sanhokMapImage,
    size: 4000,
  },
  erangel: {
    id: "erangel",
    name: "erangel",
    displayName: "에란겔",
    image: erangelMapImage,
    size: 8000,
  },
  taego: {
    id: "taego",
    name: "taego",
    displayName: "태이고",
    image: taegoMapImage,
    size: 8000,
  },
  miramar: {
    id: "miramar",
    name: "miramar",
    displayName: "미라마",
    image: miramarMapImage,
    size: 8000,
  },
} as const;

/** 맵 ID 타입 */
export type MapId = keyof typeof MAPS;

/** 전체 맵 목록 (반복용) */
export const MAP_LIST: MapConfig[] = Object.values(MAPS);

/** 기본 맵 */
export const DEFAULT_MAP_ID: MapId = "sanhok";
