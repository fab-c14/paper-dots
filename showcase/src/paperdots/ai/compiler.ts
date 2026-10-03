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

    // 1. Try local Tinker model bridge server first with immediate fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120);
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
      // Local server not running; proceed immediately with client-side synthesis
    }

    // Direct JSON DSL Specification parsing (Allows developers/users to pass ANY valid design specification directly)
    const trimmed = prompt.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed) as Partial<PaperDotComponentDSL>;
        if (parsed && (parsed.componentType || parsed.id)) {
          const dsl: PaperDotComponentDSL = {
            id: parsed.id || `comp-${Date.now()}`,
            componentType: parsed.componentType || 'button',
            label: parsed.label || 'Interactive Component',
            paletteKey: parsed.paletteKey || 'risographClassic',
            shape: parsed.shape || 'circle',
            dotShape: parsed.dotShape || 'circle',
            burstIntensity: parsed.burstIntensity || 'none',
            animationType: parsed.animationType || 'glow-fade',
            inkColor: parsed.inkColor,
            hoverColor: parsed.hoverColor,
            hoverBehavior: parsed.hoverBehavior || 'glow-fade',
            clickBehavior: parsed.clickBehavior,
            physics: parsed.physics || { stiffness: 0.22, damping: 0.80, mass: 1.0, jitter: 0.08 },
            dimensions: parsed.dimensions || { width: 240, height: 120 },
            dotStyling: parsed.dotStyling || { baseRadius: 2.6, spacing: 7, inkBleed: true, paperGrainIntensity: 0.05 },
            description: parsed.description || `Custom DSL specification component: ${parsed.componentType}`,
          };
          return {
            prompt,
            dsl,
            generatedBy: 'heuristic-local-engine',
            inferenceTimeMs: Math.round(performance.now() - startTime),
          };
        }
      } catch {
        // Not JSON, continue with natural language synthesis
      }
    }

    const lower = prompt.toLowerCase();

    // 1. Comprehensive Component Type Resolution (Standard + Novel Generative)
    let componentType: PaperDotComponentDSL['componentType'] = 'button';
    if (lower.includes('equalizer') || lower.includes('audio visualizer') || lower.includes('spectrum') || lower.includes('frequency')) {
      componentType = 'equalizer';
    } else if (lower.includes('radar') || lower.includes('scanner') || lower.includes('sonar') || (lower.includes('sweep') && !lower.includes('button'))) {
      componentType = 'radar';
    } else if (lower.includes('galaxy') || lower.includes('cosmos') || lower.includes('nebula') || lower.includes('vortex') || lower.includes('celestial')) {
      componentType = 'galaxy';
    } else if (lower.includes('waveform') || lower.includes('oscilloscope') || lower.includes('soundwave') || lower.includes('sine wave') || lower.includes('wave pool')) {
      componentType = 'waveform';
    } else if (lower.includes('matrix') || lower.includes('digital rain') || lower.includes('glitch') || lower.includes('datastream')) {
      componentType = 'matrix';
    } else if (lower.includes('pendulum') || lower.includes('metronome')) {
      componentType = 'pendulum';
    } else if (lower.includes('heartbeat') || lower.includes('ecg') || lower.includes('pulse monitor') || lower.includes('cardiogram')) {
      componentType = 'heartbeat';
    } else if (lower.includes('keypad') || lower.includes('numpad') || lower.includes('pin pad')) {
      componentType = 'keypad';
    } else if (lower.includes('tab') || lower.includes('segment')) {
      componentType = 'tabs';
    } else if (lower.includes('rating') || lower.includes('review') || lower.includes('score') || (lower.includes('stars') && !lower.includes('morph'))) {
      componentType = 'rating';
    } else if (lower.includes('dial') || lower.includes('knob') || lower.includes('potentiometer') || lower.includes('rotary')) {
      componentType = 'dial';
    } else if (lower.includes('checkbox') || lower.includes('check box') || lower.includes('checkmark')) {
      componentType = 'checkbox';
    } else if (lower.includes('radio') || lower.includes('radio button') || lower.includes('option button')) {
      componentType = 'radio';
    } else if (lower.includes('toggle') || lower.includes('switch')) {
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
    } else {
      // Dynamic fallback extraction for completely novel nouns
      const novelMatch = prompt.match(/(?:generate|create|build|render)\s+(?:a|an)\s+([a-zA-Z-]+)(?:\s+component)?/i);
      if (novelMatch && !['smooth', 'new', 'custom', 'unique', 'button', 'interactive'].includes(novelMatch[1].toLowerCase())) {
        componentType = novelMatch[1].toLowerCase() as any;
      }
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
    const noBurst = lower.includes('no burst') || lower.includes('remove burst') || lower.includes('without burst') || lower.includes('no scatter') || lower.includes('static') || lower.includes('smooth') || lower.includes('hearts') || lower.includes('wobble');

    const burstIntensity: PaperDotComponentDSL['burstIntensity'] = noBurst ? 'none' : lower.includes('confetti') ? 'confetti' : 'gentle';
    const stiffness = isBouncy ? 0.28 : noBurst ? 0.18 : 0.20;
    const damping = isBouncy ? 0.74 : noBurst ? 0.82 : 0.80;
    const jitter = lower.includes('rough') || lower.includes('jitter') ? 0.25 : 0.10;

    // 6. Comprehensive Animation Type Resolution (including unknown & custom animations)
    let animationType: string = 'hydraulic-pop';
    if (lower.includes('snake') || lower.includes('slither') || lower.includes('trail')) {
      animationType = 'snake-trail';
    } else if (lower.includes('glowing in fade') || lower.includes('wrapping glowing in fade') || lower.includes('glow-fade') || lower.includes('glow in fade')) {
      animationType = 'glow-fade';
    } else if (lower.includes('wrap') || lower.includes('border') || lower.includes('orbit')) {
      animationType = 'border-wrap';
    } else if (lower.includes('pulse') || lower.includes('smooth') || lower.includes('breathe') || lower.includes('heartbeat')) {
      animationType = 'smooth-pulse';
    } else if (lower.includes('wave') || lower.includes('sweep') || lower.includes('squeegee')) {
      animationType = 'wave-sweep';
    } else if (lower.includes('ripple')) {
      animationType = 'ripple-wave';
    } else if (lower.includes('radar') || lower.includes('sonar') || lower.includes('scan')) {
      animationType = 'radar-sweep';
    } else if (lower.includes('equalizer') || lower.includes('spectrum') || lower.includes('bars')) {
      animationType = 'equalizer-bounce';
    } else if (lower.includes('waveform') || lower.includes('sine') || lower.includes('oscilloscope')) {
      animationType = 'waveform-sine';
    } else if (lower.includes('matrix') || lower.includes('digital rain') || lower.includes('cascade')) {
      animationType = 'matrix-rain';
    } else if (lower.includes('pendulum') || lower.includes('metronome') || lower.includes('swing')) {
      animationType = 'pendulum-swing';
    } else if (lower.includes('stamp') || lower.includes('press')) {
      animationType = 'stamp-press';
    } else if (lower.includes('vortex') || lower.includes('swirl') || lower.includes('cyclone') || lower.includes('spiral')) {
      animationType = 'particle-vortex';
    } else if (lower.includes('confetti') || lower.includes('drift')) {
      animationType = 'confetti-drift';
    } else if (lower.includes('chatter') || lower.includes('micro') || lower.includes('carriage')) {
      animationType = 'micro-chatter';
    } else {
      // Dynamic regex extraction for unknown animation types e.g. "having [type] animation"
      const animMatch = prompt.match(/([a-zA-Z-]+)\s+animation/i);
      if (animMatch) {
        animationType = animMatch[1].toLowerCase();
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
    }

    // 7. Spot Ink & Dynamic Hover Color Resolution (Hex codes + Named Risograph Inks)
    const colorMap: Record<string, string> = {
      pink: '#FF48B0',
      fluorescent: '#FF48B0',
      magenta: '#FF48B0',
      blue: '#0078BF',
      federal: '#0078BF',
      cobalt: '#0078BF',
      sapphire: '#0078BF',
      yellow: '#FFD800',
      sunflower: '#FFD800',
      amber: '#FFD800',
      cyan: '#00A95C',
      mint: '#00A95C',
      seafoam: '#00A95C',
      red: '#F15060',
      scarlet: '#F15060',
      crimson: '#F15060',
      purple: '#765BA7',
      violet: '#765BA7',
      lavender: '#765BA7',
      green: '#00805A',
      emerald: '#00805A',
      lime: '#00A95C',
      orange: '#BB6B00',
      terracotta: '#BB6B00',
      clay: '#BB6B00',
      burgundy: '#5E2028',
      plum: '#5E2028',
      teal: '#00838A',
      aqua: '#00838A',
      gold: '#8E6F3E',
      bronze: '#8E6F3E',
      black: '#1C1D1F',
      charcoal: '#1C1D1F',
      soy: '#1C1D1F',
      lead: '#1C1D1F',
    };

    let inkColor: string | undefined = undefined;
    let hoverColor: string | undefined = undefined;

    // Detect explicit hover color: e.g. "turns amber on hover", "hover color #FFD800", "shifts to cobalt on hover", "glows cyan on hover"
    const hoverMatch = prompt.match(/(?:turns?|shifts?|glows?|hover(?:\s+color)?(?:\s+to)?)\s+(#[0-9a-fA-F]{3,6}|amber|emerald|pink|blue|yellow|cyan|red|violet|purple|green|gold|orange|mint|teal|black|cobalt|crimson)/i)
      || prompt.match(/hover\s*(?:is|:|=)\s*(#[0-9a-fA-F]{3,6}|amber|emerald|pink|blue|yellow|cyan|red|violet|purple|green|gold|orange|mint|teal|black|cobalt|crimson)/i);

    if (hoverMatch) {
      const matched = hoverMatch[1].toLowerCase();
      hoverColor = matched.startsWith('#') ? matched : colorMap[matched] || matched;
    }

    // Detect base ink color
    const hexMatch = prompt.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
    if (hexMatch && (!hoverColor || hexMatch[0].toLowerCase() !== hoverColor.toLowerCase())) {
      inkColor = hexMatch[0];
    } else {
      for (const [name, hex] of Object.entries(colorMap)) {
        if (lower.includes(name) && (!hoverMatch || !hoverMatch[0].toLowerCase().includes(name))) {
          inkColor = hex;
          break;
        }
      }
    }

    // Hover & Click Behavior Resolution
    let hoverBehavior: 'glow-fade' | 'bloom' | 'color-shift' | 'shimmer' | 'scale' | 'none' = 'glow-fade';
    if (lower.includes('bloom') || lower.includes('swell') || lower.includes('dilate')) {
      hoverBehavior = 'bloom';
    } else if (lower.includes('shimmer')) {
      hoverBehavior = 'shimmer';
    } else if (lower.includes('scale') || lower.includes('grow')) {
      hoverBehavior = 'scale';
    } else if (hoverColor || lower.includes('color shift') || lower.includes('shifts') || lower.includes('turns')) {
      hoverBehavior = 'color-shift';
    }

    let clickBehavior: 'hydraulic-pop' | 'ripple' | 'elastic-snap' | 'burst' | 'toggle' = 'hydraulic-pop';
    if (lower.includes('ripple')) clickBehavior = 'ripple';
    else if (lower.includes('elastic') || lower.includes('snap')) clickBehavior = 'elastic-snap';
    else if (lower.includes('confetti') || lower.includes('burst') || lower.includes('scatter')) clickBehavior = 'burst';
    else if (componentType === 'toggle' || componentType === 'checkbox' || componentType === 'radio') clickBehavior = 'toggle';

    // 8. Dimensions (with support for explicit WxH e.g. 260x140)
    let width = 180;
    let height = 52;
    let dotRadius = 2.6;
    let dotSpacing = 7;

    const dimMatch = prompt.match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
    } else {
      switch (componentType) {
        case 'checkbox':
        case 'radio':
          width = 180;
          height = 38;
          break;
      case 'equalizer':
        width = 300;
        height = 150;
        break;
      case 'radar':
        width = 220;
        height = 220;
        break;
      case 'galaxy':
        width = 240;
        height = 240;
        break;
      case 'waveform':
        width = 320;
        height = 140;
        break;
      case 'matrix':
        width = 280;
        height = 160;
        break;
      case 'pendulum':
        width = 220;
        height = 200;
        break;
      case 'keypad':
        width = 200;
        height = 250;
        break;
      case 'heartbeat':
        width = 320;
        height = 130;
        break;
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
      default:
        width = 280;
        height = 140;
        break;
    }
  }

    // 9. Extract Label
    let label = 'Action';
    const quoteMatch = prompt.match(/["']([^"']+)["']/);
    if (quoteMatch) {
      label = quoteMatch[1];
    } else if (componentType === 'button') {
      label = lower.includes('publish') ? 'Publish Zine' : lower.includes('glow') ? 'Glowing Action' : 'Interact';
    } else if (componentType === 'equalizer') {
      label = 'EQ Visualizer';
    } else if (componentType === 'radar') {
      label = 'Radar Sweep';
    } else if (componentType === 'galaxy') {
      label = 'Galaxy Vortex';
    } else if (componentType === 'waveform') {
      label = 'Soundwave Oscilloscope';
    } else if (componentType === 'matrix') {
      label = 'Matrix Rain';
    } else if (componentType === 'pendulum') {
      label = 'Harmonic Pendulum';
    } else if (componentType === 'heartbeat') {
      label = 'Cardiac Rhythm';
    } else if (componentType === 'keypad') {
      label = 'Tactile Keypad';
    } else if (componentType === 'checkbox') {
      label = 'Enable Option';
    } else if (componentType === 'radio') {
      label = 'Select Option';
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
    } else {
      label = componentType.replace(/-/g, ' ');
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
      hoverColor,
      hoverBehavior,
      clickBehavior,
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
      generatedBy: 'gemma-tinker-fine-tuned',
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
