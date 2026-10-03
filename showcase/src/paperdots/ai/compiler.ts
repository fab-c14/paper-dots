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
    if (lower.includes('tab') || lower.includes('segment')) {
      componentType = 'tabs';
    } else if (lower.includes('rating') || lower.includes('review') || lower.includes('score') || (lower.includes('stars') && !lower.includes('morph'))) {
      componentType = 'rating';
    } else if (lower.includes('dial') || lower.includes('knob') || lower.includes('potentiometer') || lower.includes('rotary')) {
      componentType = 'dial';
    } else if (lower.includes('slider') || lower.includes('volume') || lower.includes('fader') || lower.includes('range')) {
      componentType = 'slider';
    } else if (lower.includes('toggle') || lower.includes('switch') || lower.includes('checkbox')) {
      componentType = 'toggle';
    } else if (lower.includes('badge') || lower.includes('tag') || lower.includes('pill') || lower.includes('status')) {
      componentType = 'badge';
    } else if (lower.includes('progress') || lower.includes('meter') || lower.includes('gauge') || lower.includes('progress bar')) {
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

    // 6. Comprehensive Animation Type Resolution
    let animationType: string = 'hydraulic-pop';
    if (lower.includes('snake') || lower.includes('slither') || lower.includes('trail')) {
      animationType = 'snake-trail';
    } else if (lower.includes('wrap') || lower.includes('border') || lower.includes('orbit')) {
      animationType = 'border-wrap';
    } else if (lower.includes('glow') || lower.includes('fade') || lower.includes('bloom')) {
      animationType = 'glow-fade';
    } else if (lower.includes('pulse') || lower.includes('smooth') || lower.includes('breathe') || lower.includes('heartbeat')) {
      animationType = 'smooth-pulse';
    } else if (lower.includes('wave') || lower.includes('sweep') || lower.includes('squeegee')) {
      animationType = 'wave-sweep';
    } else if (lower.includes('ripple')) {
      animationType = 'ripple-wave';
    } else if (lower.includes('stamp') || lower.includes('press')) {
      animationType = 'stamp-press';
    } else if (lower.includes('vortex') || lower.includes('swirl') || lower.includes('cyclone')) {
      animationType = 'particle-vortex';
    } else if (lower.includes('confetti') || lower.includes('drift')) {
      animationType = 'confetti-drift';
    } else if (lower.includes('chatter') || lower.includes('micro') || lower.includes('carriage')) {
      animationType = 'micro-chatter';
    } else if (componentType === 'slider') {
      if (lower.includes('tick') || lower.includes('magnetic') || lower.includes('notch')) animationType = 'magnetic-tick';
      else if (lower.includes('dilate') || lower.includes('dilation')) animationType = 'ink-dilation';
      else animationType = 'elastic-string';
    } else if (componentType === 'toggle') {
      if (lower.includes('flip') || lower.includes('page')) animationType = 'page-flip';
      else if (lower.includes('snap') || lower.includes('slingshot')) animationType = 'slingshot-snap';
      else animationType = 'cylinder-roll';
    } else if (componentType === 'progress') {
      if (lower.includes('cascade') || lower.includes('domino')) animationType = 'domino-cascade';
      else if (lower.includes('strobe') || lower.includes('pulse')) animationType = 'strobe-pulse';
      else animationType = 'capillary-bleed';
    } else if (componentType === 'badge') {
      if (lower.includes('shimmer')) animationType = 'shimmer-wave';
      else if (lower.includes('float') || lower.includes('drift')) animationType = 'float-drift';
      else animationType = 'beacon-pulse';
    } else if (componentType === 'input') {
      if (lower.includes('halo') || lower.includes('focus')) animationType = 'focus-halo';
      else if (lower.includes('perimeter')) animationType = 'perimeter-wave';
      else animationType = 'typewriter-recoil';
    } else if (componentType === 'tabs') {
      if (lower.includes('spring') || lower.includes('elastic')) animationType = 'spring-elastic';
      else if (lower.includes('fade') || lower.includes('glow')) animationType = 'glow-fade';
      else animationType = 'crawl-slide';
    } else if (componentType === 'rating') {
      if (lower.includes('pulse') || lower.includes('smooth')) animationType = 'smooth-pulse';
      else if (lower.includes('wave') || lower.includes('harmonic')) animationType = 'harmonic-wave';
      else animationType = 'bloom-expand';
    } else if (componentType === 'dial') {
      if (lower.includes('detent') || lower.includes('magnetic') || lower.includes('tick')) animationType = 'magnetic-detent';
      else if (lower.includes('snap') || lower.includes('elastic')) animationType = 'elastic-snap';
      else animationType = 'radial-sweep';
    }

    // 7. Spot Ink Color Resolution
    let inkColor: string | undefined = undefined;
    if (lower.includes('pink') || lower.includes('fluorescent')) inkColor = '#FF48B0';
    else if (lower.includes('blue') || lower.includes('federal')) inkColor = '#0078BF';
    else if (lower.includes('yellow') || lower.includes('sunflower')) inkColor = '#FFD800';
    else if (lower.includes('mint') || lower.includes('seafoam')) inkColor = '#00A95C';
    else if (lower.includes('red') || lower.includes('scarlet')) inkColor = '#F15060';
    else if (lower.includes('purple') || lower.includes('violet')) inkColor = '#765BA7';
    else if (lower.includes('green') || lower.includes('emerald')) inkColor = '#00805A';
    else if (lower.includes('terracotta') || lower.includes('clay') || lower.includes('orange')) inkColor = '#BB6B00';
    else if (lower.includes('burgundy')) inkColor = '#5E2028';
    else if (lower.includes('teal')) inkColor = '#00838A';
    else if (lower.includes('gold') || lower.includes('bronze')) inkColor = '#8E6F3E';
    else if (lower.includes('black') || lower.includes('soy') || lower.includes('lead')) inkColor = '#1C1D1F';

    // 8. Dimensions
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
      case 'tabs':
        width = 320;
        height = 44;
        break;
      case 'rating':
        width = 180;
        height = 36;
        break;
      case 'dial':
        width = 110;
        height = 110;
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

    // 9. Extract Label
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
    } else if (componentType === 'tabs') {
      label = 'Overview / Press / Halftones';
    } else if (componentType === 'rating') {
      label = shape === 'heart' ? 'Tactile Hearts' : 'Star Rating';
    } else if (componentType === 'dial') {
      label = lower.includes('volume') ? 'Volume' : lower.includes('cutoff') ? 'Cutoff' : lower.includes('zoom') ? 'Zoom' : 'Level';
    }

    const dsl: PaperDotComponentDSL = {
      id: `comp-${Date.now()}`,
      componentType,
      label,
      paletteKey,
      shape,
      dotShape,
      burstIntensity,
      animationType,
      inkColor,
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
      description: `Generative ${componentType} with ${dotShape} paper dots, ${animationType} kinetic animation, ${inkColor ? `spot ink (${inkColor})` : `${paletteKey} light paper palette`}, and tactile return physics.`,
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
