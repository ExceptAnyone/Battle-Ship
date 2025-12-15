import sanhokMapImage from "@/assets/sanhok-map.webp";
import erangelMapImage from "@/assets/에란겔.webp";

/**
 * Map configuration interface
 */
export interface MapConfig {
  id: MapNames;
  name: string;
  displayName: string;
  image: string;
  size: number; // Map size in meters (e.g., 4000x4000, 8000x8000)
}

type MapNames = "sanhok" | "erangel";

/**
 * Available maps configuration
 */
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
} as const;

/**
 * Type for map IDs
 */
export type MapId = keyof typeof MAPS;

/**
 * Array of all available maps (for iteration)
 */
export const MAP_LIST: MapConfig[] = Object.values(MAPS);

/**
 * Default map
 */
export const DEFAULT_MAP_ID: MapId = "sanhok";
