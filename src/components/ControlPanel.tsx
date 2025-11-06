import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Vec2, JumpPoint, HOTSPOTS, calcTimeToJump, calcMinimumJumpDistance } from "@/lib/jumpCalculator";
import { Plane, Target, Navigation, MapPin, Clock, Ruler } from "lucide-react";

interface ControlPanelProps {
  planeStart: Vec2 | null;
  planeEnd: Vec2 | null;
  target: Vec2 | null;
  jumpDistance: number;
  planeSpeed: number;
  jumpPoints: JumpPoint[];
  onJumpDistanceChange: (value: number) => void;
  onPlaneSpeedChange: (value: number) => void;
  onTargetSet: (pos: Vec2) => void;
  onReset: () => void;
}

export function ControlPanel({
  planeStart,
  planeEnd,
  target,
  jumpDistance,
  planeSpeed,
  jumpPoints,
  onJumpDistanceChange,
  onPlaneSpeedChange,
  onTargetSet,
  onReset,
}: ControlPanelProps) {
  const recommendedPoint = jumpPoints.find((jp) => jp.isRecommended);
  const minDistance = planeStart && planeEnd && target 
    ? calcMinimumJumpDistance(planeStart, planeEnd, target)
    : null;

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-card border-l border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary" />
            사녹 점프 계산기
          </h1>
          <p className="text-sm text-muted-foreground">
            비행기 경로와 목표 지점을 설정하여 최적의 점프 위치를 찾으세요
          </p>
        </div>

        {/* Jump Distance Slider */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              점프 거리
            </label>
            <Badge variant="secondary">{jumpDistance}m</Badge>
          </div>
          <Slider
            value={[jumpDistance]}
            onValueChange={([value]) => onJumpDistanceChange(value)}
            min={1200}
            max={1300}
            step={10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            파라슈트로 이동 가능한 최대 거리
          </p>
        </Card>

        {/* Plane Speed Slider */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Plane className="w-4 h-4 text-secondary" />
              비행기 속도
            </label>
            <Badge variant="secondary">{planeSpeed} km/h</Badge>
          </div>
          <Slider
            value={[planeSpeed]}
            onValueChange={([value]) => onPlaneSpeedChange(value)}
            min={250}
            max={350}
            step={10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            시간 계산을 위한 비행기 속도 설정
          </p>
        </Card>

        {/* Jump Info */}
        {recommendedPoint && (
          <Card className="p-4 space-y-3 border-primary bg-primary/5">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">추천 점프 지점</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">시작점에서 거리</span>
                <Badge variant="outline">{recommendedPoint.distance.toFixed(0)}m</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  예상 시간
                </span>
                <Badge variant="outline">
                  {calcTimeToJump(recommendedPoint.distance, planeSpeed / 3.6).toFixed(1)}초
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">좌표</span>
                <span className="font-mono text-xs">
                  ({recommendedPoint.position.x.toFixed(0)}, {recommendedPoint.position.y.toFixed(0)})
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* No intersection warning */}
        {planeStart && planeEnd && target && jumpPoints.length === 0 && (
          <Card className="p-4 space-y-2 border-destructive bg-destructive/10">
            <h3 className="font-semibold text-destructive">교점 없음</h3>
            <p className="text-sm text-muted-foreground">
              현재 점프 거리로는 비행 경로에서 목표 지점에 도달할 수 없습니다.
            </p>
            {minDistance && (
              <p className="text-sm">
                <span className="text-muted-foreground">최소 필요 거리: </span>
                <Badge variant="destructive">{minDistance.toFixed(0)}m</Badge>
              </p>
            )}
          </Card>
        )}

        {/* Multiple jump points info */}
        {jumpPoints.length > 1 && (
          <Card className="p-4 space-y-2 border-secondary bg-secondary/10">
            <h3 className="font-semibold">대체 점프 지점</h3>
            <p className="text-sm text-muted-foreground">
              {jumpPoints.length}개의 점프 가능 지점이 있습니다. 진행 방향 앞쪽 지점을 추천합니다.
            </p>
          </Card>
        )}

        {/* Hotspot Presets */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            핫스팟 프리셋
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {HOTSPOTS.map((hotspot) => (
              <Button
                key={hotspot.name}
                variant="outline"
                size="sm"
                onClick={() => onTargetSet(hotspot.position)}
                className="text-xs"
              >
                {hotspot.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Button variant="destructive" className="w-full" onClick={onReset}>
          초기화
        </Button>

        {/* Instructions */}
        <Card className="p-4 space-y-2 bg-muted">
          <h3 className="text-sm font-semibold">사용 방법</h3>
          <ol className="text-xs space-y-1 text-muted-foreground list-decimal list-inside">
            <li>맵을 클릭하여 비행기 시작점 설정</li>
            <li>다시 클릭하여 비행기 종료점 설정</li>
            <li>목표 착지 지점 클릭</li>
            <li>점프 거리 조절하여 최적화</li>
            <li>추천 점프 지점에서 낙하!</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
