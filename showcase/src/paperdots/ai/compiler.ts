import type { PaperDotComponentDSL, PromptToComponentResult } from './dsl';
import type { PresetShape } from '../types';

export class PaperDotsAICompiler {
  /**
   * Translates a natural language prompt into a PaperDots DSL specification.
   */
  public static async compilePrompt(prompt: string): Promise<PromptToComponentResult> {
    const startTime = performance.now();
    const lower = prompt.toLowerCase();

    // 1. Determine Component Type
    let componentType: PaperDotComponentDSL['componentType'] = 'button';
    if (lower.includes('slider') || lower.includes('volume') || lower.includes('fader') || lower.includes('range')) {
      componentType = 'slider';
    } else if (lower.includes('toggle') || lower.includes('switch') || lower.includes('checkbox')) {
      componentType = 'toggle';
    } else if (lower.includes('load') || lower.includes('spinner') || lower.includes('wait') || lower.includes('orbital')) {
      componentType = 'loader';
    } else if (lower.includes('morph') || lower.includes('star') || lower.includes('heart') || lower.includes('icon') || lower.includes('shape')) {
      componentType = 'morph';
    } else if (lower.includes('card') || lower.includes('box') || lower.includes('sheet') || lower.includes('container')) {
      componentType = 'card';
    } else if (lower.includes('canvas') || lower.includes('grid') || lower.includes('background') || lower.includes('lattice')) {
      componentType = 'canvas';
    }

    // 2. Determine Palette
    let paletteKey: PaperDotComponentDSL['paletteKey'] = 'risographClassic';
    if (lower.includes('cyber') || lower.includes('neon') || lower.includes('dark') || lower.includes('halftone')) {
      paletteKey = 'cyberPaper';
    } else if (lower.includes('warm') || lower.includes('zine') || lower.includes('parchment') || lower.includes('orange') || lower.includes('sepia')) {
      paletteKey = 'warmZine';
    } else if (lower.includes('matcha') || lower.includes('moss') || lower.includes('green') || lower.includes('rice paper') || lower.includes('nature')) {
      paletteKey = 'matchaPaper';
    } else if (lower.includes('monochrome') || lower.includes('letterpress') || lower.includes('black') || lower.includes('grey') || lower.includes('lead')) {
      paletteKey = 'monochromePress';
    }

    // 3. Determine Shape (for morph or button)
    let shape: PresetShape = 'circle';
    if (lower.includes('heart') || lower.includes('love') || lower.includes('like')) {
      shape = 'heart';
    } else if (lower.includes('star') || lower.includes('fav')) {
      shape = 'star';
    } else if (lower.includes('play') || lower.includes('start')) {
      shape = 'play';
    } else if (lower.includes('pause') || lower.includes('stop')) {
      shape = 'pause';
    } else if (lower.includes('check') || lower.includes('done') || lower.includes('success')) {
      shape = 'check';
    } else if (lower.includes('arrow') || lower.includes('next')) {
      shape = 'arrow';
    }

    // 4. Determine Physics Characteristics
    const isBouncy = lower.includes('bounc') || lower.includes('elastic') || lower.includes('springy') || lower.includes('snappy');
    const isSoft = lower.includes('soft') || lower.includes('slow') || lower.includes('gentle') || lower.includes('subtle');
    const isJittery = lower.includes('jitter') || lower.includes('rough') || lower.includes('ink') || lower.includes('grainy') || lower.includes('organic');

    const stiffness = isBouncy ? 0.32 : isSoft ? 0.09 : 0.18;
    const damping = isBouncy ? 0.72 : isSoft ? 0.88 : 0.82;
    const jitter = isJittery ? 0.35 : 0.12;
    const scatterForce = isBouncy ? 28 : 16;

    // 5. Determine Dimensions & Styling
    let width = 180;
    let height = 54;
    let dotRadius = 2.4;
    let dotSpacing = 7;

    switch (componentType) {
      case 'slider':
        width = 260;
        height = 48;
        break;
      case 'toggle':
        width = 76;
        height = 38;
        break;
      case 'loader':
        width = 110;
        height = 110;
        break;
      case 'morph':
        width = 120;
        height = 120;
        dotRadius = 2.8;
        break;
      case 'card':
        width = 300;
        height = 180;
        break;
      case 'canvas':
        width = 500;
        height = 320;
        dotSpacing = 22;
        break;
    }

    // 6. Extract Label
    let label = 'Action';
    if (componentType === 'button') {
      const match = prompt.match(/["']([^"']+)["']/);
      if (match) {
        label = match[1];
      } else if (lower.includes('press') || lower.includes('submit')) {
        label = 'Publish Zine';
      } else if (lower.includes('burst') || lower.includes('confetti')) {
        label = 'Celebrate!';
      } else if (lower.includes('play')) {
        label = 'Play Audio';
      } else {
        label = 'Interact';
      }
    } else if (componentType === 'slider') {
      label = lower.includes('volume') ? 'Volume' : lower.includes('opacity') ? 'Ink Density' : 'Bead Position';
    } else if (componentType === 'toggle') {
      label = lower.includes('dark') ? 'Night Press' : 'Risograph Mode';
    }

    const dsl: PaperDotComponentDSL = {
      id: `comp-${Date.now()}`,
      componentType,
      label,
      paletteKey,
      shape,
      physics: {
        stiffness,
        damping,
        mass: 1.0,
        jitter,
        scatterForce,
      },
      dimensions: {
        width,
        height,
      },
      dotStyling: {
        baseRadius: dotRadius,
        spacing: dotSpacing,
        inkBleed: true,
        paperGrainIntensity: 0.05,
      },
      description: `Generative paper-dot component with ${paletteKey} ink palette and tactile ${isBouncy ? 'high-elasticity spring' : 'balanced'} physics.`,
    };

    const inferenceTimeMs = Math.round(performance.now() - startTime);

    return {
      prompt,
      dsl,
      generatedBy: 'heuristic-local-engine',
      inferenceTimeMs,
    };
  }

  /**
   * Prompt template for Gemma / Tinker fine-tuning.
   */
  public static getGemmaPromptTemplate(userPrompt: string): string {
    return `<start_of_turn>user
You are PaperDots-AI, an expert generative compiler that transforms natural language UI requests into declarative 2D paper-dot physics components.
Given the user prompt below, output strictly a JSON object conforming to the PaperDotComponentDSL schema.

User Request: "${userPrompt}"
<end_of_turn>
<start_of_turn>model
`;
  }
}
