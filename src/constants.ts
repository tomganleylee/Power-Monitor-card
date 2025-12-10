/**
 * Constants for Energy Flow Card
 * Centralized configuration values to avoid magic numbers throughout the codebase
 */

/** Current version - single source of truth */
export const VERSION = '1.0.35';

/** Physics constants for particle animation */
export const PHYSICS = {
  /** Attraction force towards target (pixels per second squared) */
  ATTRACTION_STRENGTH: 2040,
  /** Maximum particle speed (pixels per second) */
  MAX_SPEED: 270,
  /** Velocity drag coefficient (0-1, higher = less drag) */
  DRAG: 0.998,
  /** Maximum particle lifetime in seconds */
  PARTICLE_LIFETIME: 3.5,
  /** Wander force multiplier for floating effect */
  WANDER_STRENGTH: 8,
  /** Wander angle change rate */
  WANDER_ANGLE_CHANGE: 0.4,
  /** Distance to target considered "arrived" (pixels) */
  ARRIVAL_DISTANCE: 30,
  /** Spawn offset randomization (pixels) */
  SPAWN_OFFSET: 20,
  /** Initial velocity randomization (pixels per second) */
  VELOCITY_RANDOMIZATION: 20,
  /** Velocity to speed conversion multiplier */
  SPEED_MULTIPLIER: 30,
} as const;

/** Particle visual constants */
export const PARTICLE = {
  /** Default particle pool size */
  POOL_SIZE: 500,
  /** Base particle radius (pixels) */
  BASE_RADIUS: 3,
  /** Maximum additional radius based on power (pixels) */
  RADIUS_SCALE: 4,
  /** Power value for maximum particle size (watts) */
  MAX_POWER_FOR_SIZE: 2000,
  /** Particle glow blur radius (pixels) */
  GLOW_BLUR: 12,
  /** Inner bright center size multiplier */
  CENTER_SIZE: 0.4,
  /** Fade in duration (seconds) */
  FADE_IN_DURATION: 0.2,
  /** Fade out start time (seconds before lifetime end) */
  FADE_OUT_START: 0.5,
  /** Full opacity value */
  FULL_OPACITY: 0.9,
} as const;

/** Power thresholds for various features */
export const THRESHOLDS = {
  /** Minimum power to display/activate (watts) */
  POWER_MIN_DISPLAY: 10,
  /** Power level considered "low" (watts) */
  POWER_LOW: 100,
  /** Power level considered "medium" (watts) */
  POWER_MEDIUM: 500,
  /** Power level considered "high" (watts) */
  POWER_HIGH: 1000,
  /** Minimum remainder power to show "Other" node (watts) */
  REMAINDER_MIN_DISPLAY: 10,
  /** Minimum unmonitored power to display (watts) */
  UNMONITORED_MIN_DISPLAY: 50,
  /** Sensor staleness threshold (milliseconds) */
  STALE_SENSOR: 60000,
  /** Debug log interval (milliseconds) */
  DEBUG_LOG_INTERVAL: 5000,
} as const;

/** Spawn rate configuration */
export const SPAWN_RATE = {
  /** Power per particle per second (watts) */
  POWER_PER_PARTICLE: 150,
  /** Minimum spawn rate (particles per second) */
  MIN_RATE: 0.5,
  /** Maximum spawn rate (particles per second) */
  MAX_RATE: 12,
} as const;

/** Layout percentages for positioning */
export const LAYOUT = {
  /** Grid node X position (percentage from left) */
  GRID_X: 0.08,
  /** Grid node Y position (percentage from top) */
  GRID_Y: 0.50,
  /** Solar node X position */
  SOLAR_X: 0.22,
  /** Solar node Y position */
  SOLAR_Y: 0.15,
  /** Battery node X position */
  BATTERY_X: 0.22,
  /** Battery node Y position */
  BATTERY_Y: 0.70,
  /** Hub node X position */
  HUB_X: 0.40,
  /** Hub node Y position (centered) */
  HUB_Y: 0.50,
  /** Category left X position */
  CATEGORY_LEFT_X: 0.55,
  /** Category right X position (zigzag) */
  CATEGORY_RIGHT_X: 0.68,
  /** Child device left X position */
  CHILD_LEFT_X: 0.80,
  /** Child device right X position (zigzag) */
  CHILD_RIGHT_X: 0.92,
  /** Top margin (pixels) */
  TOP_MARGIN: 60,
  /** Bottom margin (pixels) */
  BOTTOM_MARGIN: 60,
  /** Right margin (pixels) */
  RIGHT_MARGIN: 50,
  /** Minimum spacing between items (pixels) */
  MIN_SPACING: 60,
  /** Child vertical spacing (pixels) */
  CHILD_SPACING: 65,
} as const;

/** Node size configuration */
export const NODE_SIZES = {
  /** Solar node radius */
  SOLAR_RADIUS: 50,
  /** Battery node radius */
  BATTERY_RADIUS: 45,
  /** Grid node radius */
  GRID_RADIUS: 45,
  /** Hub node radius */
  HUB_RADIUS: 50,
  /** Category node radius */
  CATEGORY_RADIUS: 35,
  /** Device node radius */
  DEVICE_RADIUS: 30,
  /** Remainder node radius */
  REMAINDER_RADIUS: 25,
} as const;

/** Color palette */
export const COLORS = {
  /** Solar energy color */
  SOLAR: '#ffa500',
  /** Battery energy color */
  BATTERY: '#4caf50',
  /** Grid energy color */
  GRID: '#f44336',
  /** Hub/home color */
  HUB: '#64b5f6',
  /** Inactive/off color */
  INACTIVE: '#cccccc',
  /** Low power device color */
  DEVICE_LOW: '#4caf50',
  /** Medium power device color */
  DEVICE_MEDIUM: '#2196f3',
  /** High power device color */
  DEVICE_HIGH: '#ff9800',
  /** Very high power device color */
  DEVICE_VERY_HIGH: '#f44336',
  /** Remainder/unknown color */
  REMAINDER: '#9e9e9e',
  /** Warning color */
  WARNING: '#ff0000',
  /** Stale indicator color */
  STALE: '#ff9800',
  /** Node fill color */
  NODE_FILL: 'rgba(15, 25, 40, 0.85)',
  /** Category fill color (slightly lighter) */
  CATEGORY_FILL: 'rgba(20, 35, 55, 0.9)',
  /** Remainder fill color */
  REMAINDER_FILL: 'rgba(15, 25, 40, 0.75)',
} as const;

/** Animation timing */
export const ANIMATION = {
  /** Warning pulse duration (milliseconds) */
  WARNING_PULSE_DURATION: 1500,
  /** Battery charging pulse duration (milliseconds) */
  CHARGING_PULSE_DURATION: 2000,
  /** Resize debounce delay (milliseconds) */
  RESIZE_DEBOUNCE: 150,
  /** Default update interval (milliseconds) */
  DEFAULT_UPDATE_INTERVAL: 2000,
} as const;

/** Sankey flow configuration */
export const SANKEY = {
  /** Power to width scale (pixels per watt) */
  POWER_TO_WIDTH: 0.05,
  /** Maximum flow width (pixels) */
  MAX_WIDTH: 100,
  /** Minimum width to show label (pixels) */
  MIN_WIDTH_FOR_LABEL: 5,
} as const;

/** Battery indicator thresholds */
export const BATTERY = {
  /** SOC threshold for "high" (green) */
  SOC_HIGH: 80,
  /** SOC threshold for "medium" (orange) */
  SOC_MEDIUM: 20,
  /** Bar width multiplier relative to node radius */
  BAR_WIDTH_MULTIPLIER: 1.5,
  /** Bar height (pixels) */
  BAR_HEIGHT: 8,
} as const;

/** Default configuration values */
export const DEFAULTS = {
  /** Default update interval (milliseconds) */
  UPDATE_INTERVAL: 2000,
  /** Default minimum height (pixels) */
  MIN_HEIGHT: 1000,
  /** Default maximum height (pixels) */
  MAX_HEIGHT: 9999,
  /** Default visualization mode */
  VISUALIZATION_MODE: 'both' as const,
  /** Default show statistics */
  SHOW_STATISTICS: false,
} as const;
