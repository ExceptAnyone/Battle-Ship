import { MapId, MAPS } from "@/constants/maps";

interface MapSelectorProps {
  selectedMapId: MapId;
  onMapSelect: (mapId: MapId) => void;
}

export function MapSelector({ selectedMapId, onMapSelect }: MapSelectorProps) {
  const mapIds = Object.keys(MAPS) as MapId[];

  return (
    <div className="flex flex-col gap-2">
      {mapIds.map((mapId) => {
        const map = MAPS[mapId];
        const isSelected = selectedMapId === mapId;

        return (
          <button
            key={mapId}
            onClick={() => onMapSelect(mapId)}
            className={`
              px-6 py-2 rounded-lg font-medium transition-all text-left
              ${
                isSelected
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {map.name}
          </button>
        );
      })}
    </div>
  );
}
