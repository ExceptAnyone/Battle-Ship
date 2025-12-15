import { useState, useEffect } from "react";
import { SanhokMap } from "@/components/SanhokMap";
import { Vec2, calcJumpPoints, JumpPoint } from "@/lib/jumpCalculator";

const Index = () => {
  const [planeStart, setPlaneStart] = useState<Vec2 | null>(null);
  const [planeEnd, setPlaneEnd] = useState<Vec2 | null>(null);
  const [target, setTarget] = useState<Vec2 | null>(null);
  const [jumpDistance, setJumpDistance] = useState(1250); // Default 1250m
  const [planeSpeed, setPlaneSpeed] = useState(300); // Default 300 km/h
  const [jumpPoints, setJumpPoints] = useState<JumpPoint[]>([]);

  // Recalculate jump points whenever inputs change
  useEffect(() => {
    if (planeStart && planeEnd && target) {
      const points = calcJumpPoints(planeStart, planeEnd, target, jumpDistance);
      setJumpPoints(points);
    } else {
      setJumpPoints([]);
    }
  }, [planeStart, planeEnd, target, jumpDistance]);

  const handleReset = () => {
    setPlaneStart(null);
    setPlaneEnd(null);
    setTarget(null);
    setJumpPoints([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-background">
      <div className="flex-1 relative">
        <SanhokMap
          planeStart={planeStart}
          planeEnd={planeEnd}
          target={target}
          jumpDistance={jumpDistance}
          onPlaneStartSet={setPlaneStart}
          onPlaneEndSet={setPlaneEnd}
          onTargetSet={setTarget}
          jumpPoints={jumpPoints}
          onReset={handleReset}
        />
      </div>
      {/* <ControlPanel
        planeStart={planeStart}
        planeEnd={planeEnd}
        target={target}
        jumpDistance={jumpDistance}
        planeSpeed={planeSpeed}
        jumpPoints={jumpPoints}
        onJumpDistanceChange={setJumpDistance}
        onPlaneSpeedChange={setPlaneSpeed}
        onTargetSet={setTarget}
        onReset={handleReset}
      /> */}
    </div>
  );
};

export default Index;
