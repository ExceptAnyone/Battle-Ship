import { describe, it, expect } from 'vitest';
import {
  vec,
  calcJumpPoints,
  calcMinimumJumpDistance,
  calcTimeToJump,
  Vec2,
} from './jumpCalculator';

describe('vec - 벡터 연산', () => {
  describe('vec.sub', () => {
    it('두 벡터를 올바르게 뺀다', () => {
      const result = vec.sub({ x: 5, y: 10 }, { x: 3, y: 4 });
      expect(result).toEqual({ x: 2, y: 6 });
    });

    it('같은 벡터를 빼면 영벡터를 반환한다', () => {
      const result = vec.sub({ x: 3, y: 7 }, { x: 3, y: 7 });
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('음수 값을 처리한다', () => {
      const result = vec.sub({ x: -2, y: 3 }, { x: 5, y: -4 });
      expect(result).toEqual({ x: -7, y: 7 });
    });
  });

  describe('vec.add', () => {
    it('두 벡터를 올바르게 더한다', () => {
      const result = vec.add({ x: 2, y: 3 }, { x: 4, y: 5 });
      expect(result).toEqual({ x: 6, y: 8 });
    });

    it('음수 값을 처리한다', () => {
      const result = vec.add({ x: -3, y: 5 }, { x: 3, y: -2 });
      expect(result).toEqual({ x: 0, y: 3 });
    });
  });

  describe('vec.dot', () => {
    it('내적을 올바르게 계산한다', () => {
      const result = vec.dot({ x: 2, y: 3 }, { x: 4, y: 5 });
      expect(result).toBe(23); // 2*4 + 3*5 = 8 + 15 = 23
    });

    it('수직인 벡터의 내적은 0을 반환한다', () => {
      const result = vec.dot({ x: 1, y: 0 }, { x: 0, y: 1 });
      expect(result).toBe(0);
    });

    it('음수 값을 처리한다', () => {
      const result = vec.dot({ x: -2, y: 3 }, { x: 4, y: -1 });
      expect(result).toBe(-11); // -2*4 + 3*(-1) = -8 + (-3) = -11
    });
  });

  describe('vec.len', () => {
    it('(3, 4)의 길이를 5로 계산한다', () => {
      const result = vec.len({ x: 3, y: 4 });
      expect(result).toBe(5);
    });

    it('영벡터의 길이는 0을 반환한다', () => {
      const result = vec.len({ x: 0, y: 0 });
      expect(result).toBe(0);
    });

    it('음수 성분을 처리한다', () => {
      const result = vec.len({ x: -3, y: -4 });
      expect(result).toBe(5);
    });
  });

  describe('vec.mul', () => {
    it('벡터에 스칼라를 곱한다', () => {
      const result = vec.mul({ x: 2, y: 3 }, 4);
      expect(result).toEqual({ x: 8, y: 12 });
    });

    it('스칼라가 0인 경우를 처리한다', () => {
      const result = vec.mul({ x: 5, y: 10 }, 0);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('음수 스칼라를 처리한다', () => {
      const result = vec.mul({ x: 3, y: -2 }, -2);
      expect(result).toEqual({ x: -6, y: 4 });
    });
  });

  describe('vec.normalize', () => {
    it('벡터를 단위 길이로 정규화한다', () => {
      const result = vec.normalize({ x: 3, y: 4 });
      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });

    it('영벡터 입력 시 영벡터를 반환한다', () => {
      const result = vec.normalize({ x: 0, y: 0 });
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('축 정렬된 벡터를 처리한다', () => {
      const resultX = vec.normalize({ x: 10, y: 0 });
      expect(resultX).toEqual({ x: 1, y: 0 });

      const resultY = vec.normalize({ x: 0, y: -5 });
      expect(resultY).toEqual({ x: 0, y: -1 });
    });

    it('정규화된 벡터의 길이는 1이다', () => {
      const result = vec.normalize({ x: 7, y: 11 });
      const length = vec.len(result);
      expect(length).toBeCloseTo(1);
    });
  });
});

describe('calcJumpPoints', () => {
  describe('엣지 케이스 - 경로 길이가 0인 경우', () => {
    it('A와 B가 같으면 빈 배열을 반환한다', () => {
      const A: Vec2 = { x: 100, y: 100 };
      const B: Vec2 = { x: 100, y: 100 };
      const T: Vec2 = { x: 150, y: 100 };
      const d = 100;

      const result = calcJumpPoints(A, B, T, d);
      expect(result).toEqual([]);
    });
  });

  describe('교점 없음', () => {
    it('목표가 경로에서 너무 멀면 빈 배열을 반환한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 50, y: 200 }; // 경로에서 멀리 떨어짐
      const d = 50; // 점프 거리가 목표까지의 거리보다 작음

      const result = calcJumpPoints(A, B, T, d);
      expect(result).toEqual([]);
    });

    it('점프 반경이 0이면 빈 배열을 반환한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 50, y: 10 };
      const d = 0;

      const result = calcJumpPoints(A, B, T, d);
      expect(result).toEqual([]);
    });
  });

  describe('접선 - 원이 경로에 접하는 경우', () => {
    it('원이 경로에 접하면 1개 또는 매우 가까운 2개의 점을 반환한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 50, y: 30 }; // 목표가 경로에서 30 단위 떨어짐
      const d = 30; // 정확히 접선

      const result = calcJumpPoints(A, B, T, d);
      // 부동소수점 정밀도로 인해 접선의 경우 1개 또는 매우 가까운 2개의 점을 반환할 수 있음
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.length).toBeLessThanOrEqual(2);
      expect(result[0].position.x).toBeCloseTo(50);
      expect(result[0].position.y).toBeCloseTo(0);
      expect(result[0].isRecommended).toBe(true);

      // 2개의 점이 반환되면 매우 가까워야 함
      if (result.length === 2) {
        const distanceBetween = vec.len(
          vec.sub(result[0].position, result[1].position)
        );
        expect(distanceBetween).toBeLessThan(0.001);
      }
    });
  });

  describe('2개의 교점', () => {
    it('경로가 원을 관통하면 2개의 점을 반환한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 50, y: 0 }; // 목표가 경로 위에 있음
      const d = 25;

      const result = calcJumpPoints(A, B, T, d);
      expect(result.length).toBe(2);
      expect(result[0].distance).toBeCloseTo(25); // 첫 번째 점 x=25
      expect(result[1].distance).toBeCloseTo(75); // 두 번째 점 x=75
    });

    it('첫 번째 점을 권장으로 표시한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 50, y: 10 };
      const d = 20;

      const result = calcJumpPoints(A, B, T, d);
      expect(result.length).toBe(2);
      expect(result[0].isRecommended).toBe(true);
      expect(result[1].isRecommended).toBe(false);
    });
  });

  describe('선분 범위 외', () => {
    it('교점이 경로 시작 전에 있으면 빈 배열을 반환한다', () => {
      const A: Vec2 = { x: 100, y: 0 };
      const B: Vec2 = { x: 200, y: 0 };
      const T: Vec2 = { x: 0, y: 0 }; // 목표가 시작점 뒤에 있음
      const d = 50;

      const result = calcJumpPoints(A, B, T, d);
      expect(result).toEqual([]);
    });

    it('교점이 경로 끝 이후에 있으면 빈 배열을 반환한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 200, y: 0 }; // 목표가 끝점 너머에 있음
      const d = 50;

      const result = calcJumpPoints(A, B, T, d);
      expect(result).toEqual([]);
    });

    it('하나의 교점만 선분 내에 있으면 1개의 점을 반환한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 120, y: 0 }; // 목표가 끝점을 약간 넘어감
      const d = 50; // 원이 선분 안으로 들어옴

      const result = calcJumpPoints(A, B, T, d);
      expect(result.length).toBe(1);
      expect(result[0].distance).toBeCloseTo(70); // 120 - 50 = 70
    });

    it('목표가 경로 시작점 경계에 있는 경우를 처리한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: -20, y: 0 }; // 목표가 시작점 앞에 있음
      const d = 50; // 원이 선분 안으로 들어옴

      const result = calcJumpPoints(A, B, T, d);
      expect(result.length).toBe(1);
      expect(result[0].distance).toBeCloseTo(30); // -20 + 50 = 30
    });
  });

  describe('속성 검증', () => {
    it('distance 속성이 A로부터의 실제 거리와 일치한다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 60, y: 20 };
      const d = 30;

      const result = calcJumpPoints(A, B, T, d);
      result.forEach((point) => {
        const actualDistance = vec.len(vec.sub(point.position, A));
        expect(point.distance).toBeCloseTo(actualDistance);
      });
    });

    it('점프 포인트가 목표로부터 정확히 d 거리에 있다', () => {
      const A: Vec2 = { x: 0, y: 0 };
      const B: Vec2 = { x: 100, y: 0 };
      const T: Vec2 = { x: 50, y: 15 };
      const d = 25;

      const result = calcJumpPoints(A, B, T, d);
      result.forEach((point) => {
        const distanceToTarget = vec.len(vec.sub(point.position, T));
        expect(distanceToTarget).toBeCloseTo(d);
      });
    });
  });
});

describe('calcMinimumJumpDistance', () => {
  it('경로 길이가 0이면 A까지의 거리를 반환한다', () => {
    const A: Vec2 = { x: 100, y: 100 };
    const B: Vec2 = { x: 100, y: 100 };
    const T: Vec2 = { x: 140, y: 130 };

    const result = calcMinimumJumpDistance(A, B, T);
    expect(result).toBe(50); // A에서 T까지의 거리: sqrt(40^2 + 30^2) = 50
  });

  it('목표가 경로 위에 있으면 0을 반환한다', () => {
    const A: Vec2 = { x: 0, y: 0 };
    const B: Vec2 = { x: 100, y: 0 };
    const T: Vec2 = { x: 50, y: 0 };

    const result = calcMinimumJumpDistance(A, B, T);
    expect(result).toBeCloseTo(0);
  });

  it('목표가 경로 옆에 있으면 수직 거리를 반환한다', () => {
    const A: Vec2 = { x: 0, y: 0 };
    const B: Vec2 = { x: 100, y: 0 };
    const T: Vec2 = { x: 50, y: 30 }; // 경로에 수직으로 30 단위 떨어짐

    const result = calcMinimumJumpDistance(A, B, T);
    expect(result).toBeCloseTo(30);
  });

  it('목표의 투영점이 경로 시작 전이면 A까지의 거리를 반환한다', () => {
    const A: Vec2 = { x: 50, y: 0 };
    const B: Vec2 = { x: 100, y: 0 };
    const T: Vec2 = { x: 20, y: 30 }; // x=20으로 투영되며, A의 x=50보다 앞

    const result = calcMinimumJumpDistance(A, B, T);
    const expectedDistance = vec.len(vec.sub(T, A)); // A까지의 거리
    expect(result).toBeCloseTo(expectedDistance);
  });

  it('목표의 투영점이 경로 끝 이후이면 B까지의 거리를 반환한다', () => {
    const A: Vec2 = { x: 0, y: 0 };
    const B: Vec2 = { x: 50, y: 0 };
    const T: Vec2 = { x: 80, y: 30 }; // x=80으로 투영되며, B의 x=50보다 뒤

    const result = calcMinimumJumpDistance(A, B, T);
    const expectedDistance = vec.len(vec.sub(T, B)); // B까지의 거리
    expect(result).toBeCloseTo(expectedDistance);
  });

  it('대각선 경로를 올바르게 처리한다', () => {
    const A: Vec2 = { x: 0, y: 0 };
    const B: Vec2 = { x: 100, y: 100 };
    const T: Vec2 = { x: 0, y: 100 }; // 대각선의 왼쪽

    const result = calcMinimumJumpDistance(A, B, T);
    // y=x 직선에서 (0,100)까지의 수직 거리는 100/sqrt(2)
    expect(result).toBeCloseTo(100 / Math.sqrt(2));
  });

  it('목표가 경로 끝점에 있는 경우 올바른 거리를 반환한다', () => {
    const A: Vec2 = { x: 0, y: 0 };
    const B: Vec2 = { x: 100, y: 0 };
    const T: Vec2 = { x: 100, y: 50 };

    const result = calcMinimumJumpDistance(A, B, T);
    expect(result).toBeCloseTo(50);
  });
});

describe('calcTimeToJump', () => {
  it('정상적인 입력에 대해 시간을 올바르게 계산한다', () => {
    const distance = 1000; // 미터
    const speed = 100; // m/s

    const result = calcTimeToJump(distance, speed);
    expect(result).toBe(10); // 1000 / 100 = 10초
  });

  it('거리가 0이면 0을 반환한다', () => {
    const result = calcTimeToJump(0, 100);
    expect(result).toBe(0);
  });

  it('짧은 거리를 처리한다', () => {
    const result = calcTimeToJump(50, 125); // 125m/s로 50m
    expect(result).toBeCloseTo(0.4);
  });

  it('긴 거리를 처리한다', () => {
    const result = calcTimeToJump(4000, 120); // 120m/s로 4km
    expect(result).toBeCloseTo(33.333, 2);
  });

  it('속도가 0이면 Infinity를 반환한다', () => {
    const result = calcTimeToJump(100, 0);
    expect(result).toBe(Infinity);
  });

  it('소수점 값을 처리한다', () => {
    const result = calcTimeToJump(333.5, 111.2);
    expect(result).toBeCloseTo(2.999, 2);
  });
});
