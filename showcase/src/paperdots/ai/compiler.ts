import type { PaperDotComponentDSL, PromptToComponentResult } from './dsl';
import type { PresetShape, DotGeometry } from '../types';

export class PaperDotsAICompiler {
  public static async checkLocalTinkerStatus(): Promise<{ connected: boolean; model?: string; adapter?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch('http://127.0.0.1:8000/api/status', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { connected: true, model: data.model, adapter: data.adapter };
      }
    } catch {
      // Local server is not currently listening
    }
    return { connected: false };
  }

  /**
   * Translates a natural language prompt into a PaperDots DSL specification.
   * Connects to local Tinker/Gemma bridge (http://127.0.0.1:8000) if active,
   * otherwise falls back instantly to the edge heuristic engine.
   */
  public static async compilePrompt(prompt: string): Promise<PromptToComponentResult> {
    const startTime = performance.now();

    // 1. Try local Tinker model bridge server first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('http://127.0.0.1:8000/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.dsl) {
          return {
            prompt,
            dsl: data.dsl,
            generatedBy: 'gemma-tinker-fine-tuned',
            inferenceTimeMs: data.inferenceTimeMs || Math.round(performance.now() - startTime),
          };
        }
      }
    } catch {
      // Local server not available, seamlessly fall back to local rule-based engine
    }

    const lower = prompt.toLowerCase();

    // 1. Determine Component Type
    let componentType: PaperDotComponentDSL['componentType'] = 'button';
    if (lower.includes('slider') || lower.includes('volume') || lower.includes('fader') || lower.includes('range')) {
      componentType = 'slider';
    } else if (lower.includes('toggle') || lower.includes('switch') || lower.includes('checkbox')) {
      componentType = 'toggle';
    } else if (lower.includes('badge') || lower.includes('tag') || lower.includes('pill') || lower.includes('status')) {
      componentType = 'badge';
    } else if (lower.includes('progress') || lower.includes('meter') || lower.includes('gauge') || lower.includes('bar')) {
      componentType = 'progress';
    } else if (lower.includes('input') || lower.includes('search') || lower.includes('field') || lower.includes('type')) {
      componentType = 'input';
    } else if (lower.includes('load') || lower.includes('spinner') || lower.includes('wait') || lower.includes('orbital')) {
      componentType = 'loader';
    } else if (lower.includes('morph') || lower.includes('star') || lower.includes('heart') || lower.includes('icon') || lower.includes('shape')) {
      componentType = 'morph';
    } else if (lower.includes('card') || lower.includes('box') || lower.includes('sheet') || lower.includes('container')) {
      componentType = 'card';
    } else if (lower.includes('canvas') || lower.includes('grid') || lower.includes('background') || lower.includes('lattice')) {
      componentType = 'canvas';
    }

    // 2. Determine Dot Geometry (Square vs Circle vs Diamond)
    let dotShape: DotGeometry = 'square';
    if (lower.includes('circle') || lower.includes('round') || lower.includes('dot') || lower.includes('stipple')) {
      dotShape = 'circle';
    } else if (lower.includes('diamond') || lower.includes('rhombus') || lower.includes('angle')) {
      dotShape = 'diamond';
    }

    // 3. Determine Light Palette (Zero dark palettes)
    let paletteKey: PaperDotComponentDSL['paletteKey'] = 'risographClassic';
    if (lower.includes('pastel') || lower.includes('pink') || lower.includes('soft') || lower.includes('coral')) {
      paletteKey = 'pastelZine';
    } else if (lower.includes('botanical') || lower.includes('ochre') || lower.includes('terracotta') || lower.includes('olive')) {
      paletteKey = 'botanicalOchre';
    } else if (lower.includes('nordic') || lower.includes('linen') || lower.includes('cobalt') || lower.includes('blue')) {
      paletteKey = 'nordicLinen';
    } else if (lower.includes('warm') || lower.includes('zine') || lower.includes('parchment') || lower.includes('sepia')) {
      paletteKey = 'warmZine';
    } else if (lower.includes('matcha') || lower.includes('moss') || lower.includes('green') || lower.includes('rice paper')) {
      paletteKey = 'matchaPaper';
    } else if (lower.includes('monochrome') || lower.includes('letterpress') || lower.includes('lead') || lower.includes('black')) {
      paletteKey = 'monochromePress';
    } else if (lower.includes('kraft') || lower.includes('postal') || lower.includes('stamp') || lower.includes('brown')) {
      paletteKey = 'kraftPostal';
    }

    // 4. Determine Shape
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

    // 5. Determine Physics & Burst Mode
    const isBouncy = lower.includes('bounc') || lower.includes('elastic') || lower.includes('springy');
    const noBurst = lower.includes('no burst') || lower.includes('no scatter') || lower.includes('static');

    const burstIntensity: PaperDotComponentDSL['burstIntensity'] = noBurst ? 'none' : 'gentle';
    const stiffness = isBouncy ? 0.28 : 0.20;
    const damping = isBouncy ? 0.74 : 0.80;
    const jitter = lower.includes('rough') || lower.includes('jitter') ? 0.25 : 0.12;

    // 6. Dimensions
    let width = 180;
    let height = 52;
    let dotRadius = 2.4;
    let dotSpacing = 7;

    switch (componentType) {
      case 'slider':
        width = 240;
        height = 48;
        break;
      case 'toggle':
        width = 72;
        height = 36;
        break;
      case 'badge':
        width = 120;
        height = 32;
        break;
      case 'progress':
        width = 240;
        height = 36;
        break;
      case 'input':
        width = 280;
        height = 46;
        break;
      case 'loader':
        width = 100;
        height = 100;
        break;
      case 'morph':
        width = 110;
        height = 110;
        dotRadius = 2.6;
        break;
      case 'card':
        width = 300;
        height = 180;
        break;
      case 'canvas':
        width = 500;
        height = 300;
        dotSpacing = 20;
        break;
    }

    // 7. Extract Label
    let label = 'Action';
    if (componentType === 'button') {
      const match = prompt.match(/["']([^"']+)["']/);
      label = match ? match[1] : lower.includes('publish') ? 'Publish Zine' : 'Interact';
    } else if (componentType === 'slider') {
      label = lower.includes('volume') ? 'Volume' : 'Level';
    } else if (componentType === 'badge') {
      label = lower.includes('live') ? 'Live Press' : lower.includes('active') ? 'In Stock' : 'Edition 01';
    } else if (componentType === 'progress') {
      label = 'Ink Transfer';
    } else if (componentType === 'input') {
      label = 'Search Zines...';
    }

    const dsl: PaperDotComponentDSL = {
      id: `comp-${Date.now()}`,
      componentType,
      label,
      paletteKey,
      shape,
      dotShape,
      burstIntensity,
      physics: {
        stiffness,
        damping,
        mass: 1.0,
        jitter,
        scatterForce: burstIntensity === 'none' ? 0 : 10,
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
      description: `Generative ${componentType} with ${dotShape} paper dots, ${paletteKey} light paper palette, and responsive tactile return physics.`,
    };

    const inferenceTimeMs = Math.round(performance.now() - startTime);

    return {
      prompt,
      dsl,
      generatedBy: 'heuristic-local-engine',
      inferenceTimeMs,
    };
  }

  public static getGemmaPromptTemplate(userPrompt: string): string {
    return `<start_of_turn>user
You are PaperDots-AI, an expert generative compiler that transforms natural language UI requests into declarative 2D paper-dot physics components.
Given the user prompt below, output strictly a JSON object conforming to the PaperDotComponentDSL schema with dotShape ('circle' or 'square') and burstIntensity ('gentle' or 'none').

User Request: "${userPrompt}"
<end_of_turn>
<start_of_turn>model
`;
  }
}
