import { Vec2 } from "@/lib/jumpCalculator";
import {
  PLANE_PATH_COLOR,
  PLANE_PATH_LINE_WIDTH,
  PLANE_PATH_DASH_PATTERN,
  TARGET_CIRCLE_COLOR,
  TARGET_CIRCLE_FILL_COLOR,
  TARGET_CIRCLE_LINE_WIDTH,
  JUMP_POINT_COLOR,
  MARKER_BORDER_COLOR,
  MARKER_BORDER_WIDTH,
  MARKER_SIZE_DEFAULT,
  MARKER_SIZE_RECOMMENDED,
  JUMP_LABEL_OFFSET,
  JUMP_LABEL_FONT,
} from "@/constants/mapConfig";

/** 원형 마커를 캔버스에 그린다 */
export function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = MARKER_BORDER_COLOR;
  ctx.lineWidth = MARKER_BORDER_WIDTH;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/** 비행기 경로 점선을 그린다 */
export function drawPlanePath(
  ctx: CanvasRenderingContext2D,
  start: Vec2,
  end: Vec2
): void {
  ctx.strokeStyle = PLANE_PATH_COLOR;
  ctx.lineWidth = PLANE_PATH_LINE_WIDTH;
  ctx.setLineDash([...PLANE_PATH_DASH_PATTERN]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** 목표 지점의 점프 반경 원과 마커를 그린다 */
export function drawTargetCircle(
  ctx: CanvasRenderingContext2D,
  targetScreen: Vec2,
  radiusInScreenPixels: number
): void {
  ctx.strokeStyle = TARGET_CIRCLE_COLOR;
  ctx.fillStyle = TARGET_CIRCLE_FILL_COLOR;
  ctx.lineWidth = TARGET_CIRCLE_LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(
    targetScreen.x,
    targetScreen.y,
    radiusInScreenPixels,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  drawMarker(ctx, targetScreen.x, targetScreen.y, TARGET_CIRCLE_COLOR, MARKER_SIZE_DEFAULT);
}

/** 비행기 시작/끝 마커를 그린다 */
export function drawPlaneMarkers(
  ctx: CanvasRenderingContext2D,
  startScreen: Vec2 | null,
  endScreen: Vec2 | null
): void {
  if (startScreen) {
    drawMarker(ctx, startScreen.x, startScreen.y, PLANE_PATH_COLOR, MARKER_SIZE_DEFAULT);
  }
  if (endScreen) {
    drawMarker(ctx, endScreen.x, endScreen.y, PLANE_PATH_COLOR, MARKER_SIZE_DEFAULT);
  }
}

/** 점프 포인트들과 추천 라벨을 그린다 */
export function drawJumpPoints(
  ctx: CanvasRenderingContext2D,
  jumpPoints: { screen: Vec2; isRecommended: boolean }[]
): void {
  jumpPoints.forEach((jp) => {
    drawMarker(
      ctx,
      jp.screen.x,
      jp.screen.y,
      JUMP_POINT_COLOR,
      jp.isRecommended ? MARKER_SIZE_RECOMMENDED : MARKER_SIZE_DEFAULT
    );

    if (jp.isRecommended) {
      ctx.fillStyle = JUMP_POINT_COLOR;
      ctx.font = JUMP_LABEL_FONT;
      ctx.textAlign = "center";
      ctx.fillText("JUMP HERE", jp.screen.x, jp.screen.y - JUMP_LABEL_OFFSET);
    }
  });
}
