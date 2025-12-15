/**
 * Map configuration constants for Sanhok map
 */

// Map dimensions
export const MAP_SIZE = 4000; // Map is 4000x4000 meters
export const MAP_PADDING_RATIO = 1.0; // Use full container space for accurate coordinate mapping
export const DEFAULT_CANVAS_SIZE = 800; // Default canvas size in pixels

// Zoom configuration
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const ZOOM_WHEEL_STEP = 0.1; // 10% zoom per wheel scroll
export const ZOOM_BUTTON_STEP = 1.2; // 20% zoom per button click

// Interaction configuration
export const DRAG_THRESHOLD_MS = 200; // Max time to distinguish click from drag

// Drawing configuration - Plane path
export const PLANE_PATH_COLOR = "#3b82f6";
export const PLANE_PATH_LINE_WIDTH = 3;
export const PLANE_PATH_DASH_PATTERN = [10, 10] as const;

// Drawing configuration - Target circle
export const TARGET_CIRCLE_COLOR = "#ef4444";
export const TARGET_CIRCLE_FILL_COLOR = "rgba(239, 68, 68, 0.1)";
export const TARGET_CIRCLE_LINE_WIDTH = 2;

// Drawing configuration - Jump points
export const JUMP_POINT_COLOR = "#f97316";

// Drawing configuration - Markers
export const MARKER_BORDER_COLOR = "white";
export const MARKER_BORDER_WIDTH = 3;
export const MARKER_SIZE_DEFAULT = 8;
export const MARKER_SIZE_RECOMMENDED = 12;
export const JUMP_LABEL_OFFSET = 20;
