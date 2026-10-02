/**
 * PaperDots UI - Core Types & Interfaces
 * Designed for 2D tactile paper & ink-dot physics and interactive UI.
 */

export interface Dot {
  id: string | number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  mass: number;
  stiffness: number;
  damping: number;
  jitter: number;
  // Confetti / scatter state
  scatterVx?: number;
  scatterVy?: number;
  isScattered?: boolean;
}

export interface SpringConfig {
  stiffness: number; // 0.05 to 0.4
  damping: number;   // 0.70 to 0.95
  mass: number;      // 0.5 to 3.0
}

export interface PointerState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  isDown: boolean;
  isInside: boolean;
  radius: number;
}

export interface RisographPalette {
  name: string;
  background: string;     // Paper background color
  paperGrain: string;     // Subtle fiber overlay
  primary: string;        // Primary ink dot color (e.g. Risograph Teal)
  secondary: string;      // Accent dot color (e.g. Fluorescent Pink)
  dark: string;           // Deep ink (Soy Black / Indigo)
  light: string;          // Highlight ink (Sunflower Yellow / Warm Cream)
  muted: string;          // Halftone ink
}

export type PresetShape = 'circle' | 'square' | 'heart' | 'star' | 'play' | 'pause' | 'check' | 'arrow';

export interface ComponentConfig {
  width: number;
  height: number;
  dotSpacing: number;
  dotRadius: number;
  palette: RisographPalette;
  spring: SpringConfig;
  interactiveRadius: number;
  paperGrainIntensity: number;
  inkBleed: boolean;
}
