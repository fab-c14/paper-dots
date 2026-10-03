import type { PresetShape, SpringConfig, DotGeometry } from '../types';

export interface PaperDotComponentDSL {
  id: string;
  componentType: 'button' | 'slider' | 'toggle' | 'checkbox' | 'radio' | 'loader' | 'morph' | 'card' | 'canvas' | 'badge' | 'progress' | 'input' | 'tabs' | 'rating' | 'dial' | 'equalizer' | 'radar' | 'keypad' | 'compass' | 'orbit' | 'ripple-pool' | 'tachometer' | 'generative' | (string & {});
  label?: string;
  paletteKey: 'risographClassic' | 'warmZine' | 'pastelZine' | 'botanicalOchre' | 'matchaPaper' | 'monochromePress' | 'nordicLinen' | 'kraftPostal';
  shape?: PresetShape;
  dotShape?: DotGeometry;
  burstIntensity?: 'none' | 'gentle' | 'confetti';
  physics: SpringConfig & {
    jitter: number;
    scatterForce?: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  dotStyling: {
    baseRadius: number;
    spacing: number;
    inkBleed: boolean;
    paperGrainIntensity: number;
  };
  animationType?: string;
  inkColor?: string;
  hoverColor?: string;
  hoverBehavior?: 'glow-fade' | 'bloom' | 'color-shift' | 'shimmer' | 'scale' | 'none' | string;
  clickBehavior?: 'ripple' | 'hydraulic-pop' | 'elastic-snap' | 'burst' | 'toggle' | string;
  description?: string;
}

export interface PromptToComponentResult {
  prompt: string;
  dsl: PaperDotComponentDSL;
  generatedBy: 'gemma-tinker-fine-tuned' | 'heuristic-local-engine';
  inferenceTimeMs: number;
}
