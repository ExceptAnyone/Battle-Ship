export type Vec2 = { x: number; y: number };

export const vec = {
  sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
  dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,
  len: (a: Vec2): number => Math.hypot(a.x, a.y),
  mul: (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s }),
  normalize: (a: Vec2): Vec2 => {
    const l = Math.hypot(a.x, a.y);
    return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
  },
};

export interface JumpPoint {
  position: Vec2;
  distance: number; // 경로 시작점(A)으로부터의 거리
  isRecommended: boolean;
}

/**
 * 비행기 경로와 목표 지점 주변 원의 교차점(점프 포인트)을 계산한다
 * @param A 비행기 경로 시작점
 * @param B 비행기 경로 끝점
 * @param T 목표 착지 지점
 * @param d 점프 거리 반경 (미터)
 * @returns 점프 포인트 배열 (0-2개)
 */
export function calcJumpPoints(
  A: Vec2,
  B: Vec2,
  T: Vec2,
  d: number
): JumpPoint[] {
  const AB = vec.sub(B, A);
  const L = vec.len(AB);

  if (L === 0) return [];

  // 비행기 경로의 단위 벡터
  const v = vec.normalize(AB);

  // 이차방정식 풀기: t^2 + 2*b*t + c = 0
  const AT = vec.sub(A, T);
  const b = vec.dot(v, AT);
  const c = vec.dot(AT, AT) - d * d;

  const discriminant = 4 * b * b - 4 * c;

  if (discriminant < 0) return [];

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-2 * b - sqrtD) / 2;
  const t2 = (-2 * b + sqrtD) / 2;

  // 경로 구간 [0, L] 내의 점만 필터링
  const validTs = [t1, t2].filter((t) => t >= 0 && t <= L);

  if (validTs.length === 0) return [];

  // 경로를 따른 거리 기준 오름차순 정렬
  validTs.sort((a, b) => a - b);

  // 점프 포인트 생성 - 첫 번째 포인트가 추천 (전진 방향)
  return validTs.map((t, idx) => ({
    position: vec.add(A, vec.mul(v, t)),
    distance: t,
    isRecommended: idx === 0,
  }));
}

/** 경로에서 목표 지점까지 필요한 최소 점프 거리를 계산한다 */
export function calcMinimumJumpDistance(A: Vec2, B: Vec2, T: Vec2): number {
  const AB = vec.sub(B, A);
  const L = vec.len(AB);

  if (L === 0) return vec.len(vec.sub(T, A));

  const v = vec.normalize(AB);
  const AT = vec.sub(T, A);

  // T를 직선 AB에 투영
  const projection = vec.dot(AT, v);
  const clampedProj = Math.max(0, Math.min(L, projection));

  const closestPoint = vec.add(A, vec.mul(v, clampedProj));
  return vec.len(vec.sub(T, closestPoint));
}

/** 점프까지의 시간을 계산한다 (초 단위) */
export function calcTimeToJump(distance: number, planeSpeed: number): number {
  return distance / planeSpeed;
}

/** 사녹 맵의 주요 핫스팟 위치 (4000x4000 좌표계) */
