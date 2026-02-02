interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
      >
        <span className="text-xl font-bold">+</span>
      </button>
      <button
        onClick={onZoomOut}
        className="bg-card/95 border border-border w-10 h-10 rounded hover:bg-accent flex items-center justify-center"
      >
        <span className="text-xl font-bold">&minus;</span>
      </button>
      <button
        onClick={onReset}
        className="bg-card/95 border border-border px-2 py-2 rounded hover:bg-accent text-xs font-medium"
      >
        Reset
      </button>
    </div>
  );
}
