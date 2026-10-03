/**
 * PaperDots UI - Core Types & Interfaces
 * Designed for 2D tactile paper & ink-dot physics and interactive UI.
 */

export type DotGeometry = 'circle' | 'square' | 'diamond';

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
  shape?: DotGeometry;
  // Confetti / scatter state
  scatterVx?: number;
  scatterVy?: number;
  isScattered?: boolean;
  scatterTime?: number;
  // Animation state tags
  delayFrames?: number;
  phaseOffset?: number;
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
  border: string;         // Card & section border tint
  cardBg: string;         // Card background
}

export type PresetShape = 'circle' | 'square' | 'heart' | 'star' | 'play' | 'pause' | 'check' | 'arrow';

export type ButtonAnimationType =
  | 'snake-trail'
  | 'border-wrap'
  | 'glow-fade'
  | 'smooth-pulse'
  | 'wave-sweep'
  | 'hydraulic-pop'
  | 'ripple-wave'
  | 'stamp-press'
  | 'particle-vortex'
  | 'confetti-drift'
  | 'micro-chatter';

export type MorphAnimationType =
  | 'smooth-heartbeat'
  | 'glow-bloom'
  | 'vortex-morph'
  | 'equalizer-wave'
  | 'crystalline-snap';

export type SliderAnimationType =
  | 'elastic-string'
  | 'ink-dilation'
  | 'magnetic-tick';

export type ToggleAnimationType =
  | 'cylinder-roll'
  | 'page-flip'
  | 'slingshot-snap';

export type ProgressAnimationType =
  | 'capillary-bleed'
  | 'domino-cascade'
  | 'strobe-pulse';

export type BadgeAnimationType =
  | 'beacon-pulse'
  | 'shimmer-wave'
  | 'float-drift';

export type InputAnimationType =
  | 'typewriter-recoil'
  | 'focus-halo'
  | 'perimeter-wave';

export type LoaderAnimationType =
  | 'constellation'
  | 'sinusoidal-wheel'
  | 'ink-bloom';

export type CardAnimationType =
  | 'magnetic-deflection'
  | 'corner-lift'
  | 'border-chase';

export type TabsAnimationType =
  | 'crawl-slide'
  | 'spring-elastic'
  | 'glow-fade';

export type RatingAnimationType =
  | 'bloom-expand'
  | 'smooth-pulse'
  | 'harmonic-wave';

export type DialAnimationType =
  | 'radial-sweep'
  | 'magnetic-detent'
  | 'elastic-snap';

export interface ComponentConfig {
  width: number;
  height: number;
  dotSpacing: number;
  dotRadius: number;
  dotShape?: DotGeometry;
  palette: RisographPalette;
  spring: SpringConfig;
  interactiveRadius: number;
  paperGrainIntensity: number;
  inkBleed: boolean;
}
