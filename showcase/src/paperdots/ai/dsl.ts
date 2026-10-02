import type { PresetShape, SpringConfig } from '../types';

export interface PaperDotComponentDSL {
  id: string;
  componentType: 'button' | 'slider' | 'toggle' | 'loader' | 'morph' | 'card' | 'canvas';
  label?: string;
  paletteKey: 'risographClassic' | 'warmZine' | 'cyberPaper' | 'matchaPaper' | 'monochromePress';
  shape?: PresetShape;
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
