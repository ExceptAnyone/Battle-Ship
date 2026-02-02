/** 맵 설정 상수 */

// 맵 크기
export const MAP_SIZE = 4000; // 맵 크기 4000x4000 미터
export const MAP_PADDING_RATIO = 1.0; // 정확한 좌표 매핑을 위해 컨테이너 전체 사용
export const DEFAULT_CANVAS_SIZE = 800; // 기본 캔버스 크기 (픽셀)

// 줌 설정
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const ZOOM_WHEEL_STEP = 0.1; // 휠 스크롤당 10% 줌
export const ZOOM_BUTTON_STEP = 1.2; // 버튼 클릭당 20% 줌

// 인터랙션 설정
export const DRAG_THRESHOLD_MS = 200; // 클릭과 드래그를 구분하는 최대 시간 (ms)

// 드로잉 설정 - 비행기 경로
export const PLANE_PATH_COLOR = "#3b82f6";
export const PLANE_PATH_LINE_WIDTH = 3;
export const PLANE_PATH_DASH_PATTERN = [10, 10] as const;

// 드로잉 설정 - 목표 원
export const TARGET_CIRCLE_COLOR = "#ef4444";
export const TARGET_CIRCLE_FILL_COLOR = "rgba(239, 68, 68, 0.1)";
export const TARGET_CIRCLE_LINE_WIDTH = 2;

// 게임 기본값
export const DEFAULT_JUMP_DISTANCE = 1250; // 기본 점프 거리 (미터)

// 드로잉 설정 - 점프 포인트
export const JUMP_POINT_COLOR = "#f97316";

// 드로잉 설정 - 마커
export const MARKER_BORDER_COLOR = "white";
export const MARKER_BORDER_WIDTH = 3;
export const MARKER_SIZE_DEFAULT = 8;
export const MARKER_SIZE_RECOMMENDED = 12;
export const JUMP_LABEL_OFFSET = 20;
export const JUMP_LABEL_FONT = "bold 12px sans-serif";
