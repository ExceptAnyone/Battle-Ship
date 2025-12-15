import { useState, useCallback } from "react";
import { MapId, DEFAULT_MAP_ID, MAPS } from "@/constants/maps";

export function useMapSelection() {
  const [selectedMapId, setSelectedMapId] = useState<MapId>(DEFAULT_MAP_ID);

  const selectMap = useCallback((mapId: MapId) => {
    setSelectedMapId(mapId);
  }, []);

  const selectedMap = MAPS[selectedMapId];

  return {
    selectedMapId,
    selectedMap,
    selectMap,
  };
}
