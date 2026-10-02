import type { PresetShape, SpringConfig, DotGeometry } from '../types';

export interface PaperDotComponentDSL {
  id: string;
  componentType: 'button' | 'slider' | 'toggle' | 'loader' | 'morph' | 'card' | 'canvas' | 'badge' | 'progress' | 'input';
  label?: string;
  paletteKey: 'risographClassic' | 'warmZine' | 'cyberPaper' | 'matchaPaper' | 'monochromePress' | 'cyanotype' | 'kraftPostal';
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
  description?: string;
}

export interface PromptToComponentResult {
  prompt: string;
  dsl: PaperDotComponentDSL;
  generatedBy: 'gemma-tinker-fine-tuned' | 'heuristic-local-engine';
  inferenceTimeMs: number;
}
