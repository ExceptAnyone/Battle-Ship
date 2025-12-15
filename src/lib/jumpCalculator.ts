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
  distance: number; // distance from A along the path
  isRecommended: boolean;
}

/**
 * Calculate jump points where plane path intersects with circle around target
 * @param A Plane path start point
 * @param B Plane path end point
 * @param T Target landing point
 * @param d Jump distance radius (in meters)
 * @returns Array of jump points (0-2 points)
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

  // Unit vector along plane path
  const v = vec.normalize(AB);

  // Solve quadratic: t^2 + 2*b*t + c = 0
  const AT = vec.sub(A, T);
  const b = vec.dot(v, AT);
  const c = vec.dot(AT, AT) - d * d;

  const discriminant = 4 * b * b - 4 * c;

  if (discriminant < 0) return [];

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-2 * b - sqrtD) / 2;
  const t2 = (-2 * b + sqrtD) / 2;

  // Filter points within path segment [0, L]
  const validTs = [t1, t2].filter((t) => t >= 0 && t <= L);

  if (validTs.length === 0) return [];

  // Sort by distance along path (ascending)
  validTs.sort((a, b) => a - b);

  // Create jump points - first point is recommended (forward direction)
  return validTs.map((t, idx) => ({
    position: vec.add(A, vec.mul(v, t)),
    distance: t,
    isRecommended: idx === 0,
  }));
}

/**
 * Calculate minimum required jump distance to reach target from path
 */
export function calcMinimumJumpDistance(A: Vec2, B: Vec2, T: Vec2): number {
  const AB = vec.sub(B, A);
  const L = vec.len(AB);

  if (L === 0) return vec.len(vec.sub(T, A));

  const v = vec.normalize(AB);
  const AT = vec.sub(T, A);

  // Project T onto line AB
  const projection = vec.dot(AT, v);
  const clampedProj = Math.max(0, Math.min(L, projection));

  const closestPoint = vec.add(A, vec.mul(v, clampedProj));
  return vec.len(vec.sub(T, closestPoint));
}

/**
 * Calculate time until jump (in seconds)
 */
export function calcTimeToJump(distance: number, planeSpeed: number): number {
  return distance / planeSpeed;
}

/**
 * Common hotspot locations on Sanhok map (4000x4000 coordinate system)
 */
