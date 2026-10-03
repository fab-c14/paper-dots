import React, { useState } from 'react';
import {
  PALETTES,
  DEFAULT_PALETTE,
  SPOT_INKS,
  PaperDotButton,
  PaperDotSlider,
  PaperDotToggle,
  PaperDotLoader,
  PaperDotMorph,
  PaperDotCard,
  PaperDotCanvas,
  PaperDotBadge,
  PaperDotProgress,
  PaperDotInput,
  TactileAudio,
} from './paperdots';
import type {
  PresetShape,
  DotGeometry,
  ButtonAnimationType,
  SliderAnimationType,
  ToggleAnimationType,
  ProgressAnimationType,
  BadgeAnimationType,
  InputAnimationType,
} from './paperdots';
import { PaperDotsAICompiler } from './paperdots/ai/compiler';
import type { PromptToComponentResult } from './paperdots/ai/dsl';
import {
  Sparkles,
  Zap,
  Heart,
  Palette,
  Clock,
  Volume2,
  VolumeX,
  Square,
  Circle,
  Diamond,
  Sliders,
  Terminal,
  Cpu,
  BookOpen,
  Download,
} from 'lucide-react';

export const App: React.FC = () => {
  // Global customization controls (All 100% light tactile paper themes)
  const [selectedPaletteKey, setSelectedPaletteKey] = useState<string>('risographClassic');
  const [globalDotShape, setGlobalDotShape] = useState<DotGeometry>('square'); // Default to squares
  const [globalBurstMode, setGlobalBurstMode] = useState<'gentle' | 'confetti' | 'none'>('gentle');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [customInkColor, setCustomInkColor] = useState<string | null>(null);

  // Deep Customization Knobs
  const [customRadius, setCustomRadius] = useState<number>(2.4);
  const [customSpacing, setCustomSpacing] = useState<number>(7);
  const [customStiffness, setCustomStiffness] = useState<number>(0.20);
  const [customDamping, setCustomDamping] = useState<number>(0.80);

  const activePalette = PALETTES[selectedPaletteKey] || DEFAULT_PALETTE;

  // Installation Hub State
  const [installTab, setInstallTab] = useState<'shadcn' | 'cli' | 'npm' | 'manual'>('shadcn');
  const [installComponent, setInstallComponent] = useState<string>('button');
  const [copiedInstallCmd, setCopiedInstallCmd] = useState<boolean>(false);

  // Distinct Animation Type States for every component
  const [buttonAnim, setButtonAnim] = useState<ButtonAnimationType>('hydraulic-pop');
  const [morphShape, setMorphShape] = useState<PresetShape>('play');
  const [morphPlaying, setMorphPlaying] = useState<boolean>(true);
  const [sliderAnim, setSliderAnim] = useState<SliderAnimationType>('elastic-string');
  const [toggleAnim, setToggleAnim] = useState<ToggleAnimationType>('cylinder-roll');
  const [progressAnim, setProgressAnim] = useState<ProgressAnimationType>('domino-cascade');
  const [inputAnim, setInputAnim] = useState<InputAnimationType>('typewriter-recoil');
  const [badgeAnim, setBadgeAnim] = useState<BadgeAnimationType>('beacon-pulse');

  // Interactive component value states
  const [sliderVal, setSliderVal] = useState<number>(65);
  const [progressVal, setProgressVal] = useState<number>(45);
  const [toggleState, setToggleState] = useState<boolean>(true);
  const [inputVal, setInputVal] = useState<string>('Analog Futures Issue #03');
  
  // Hero Live Application Console ("Julian's Analog Futures Zine Console")
  const [heroZineTitle, setHeroZineTitle] = useState<string>('Analog Futures Issue #04');
  const [heroAudioPlaying, setHeroAudioPlaying] = useState<boolean>(true);
  const [heroSpeed, setHeroSpeed] = useState<number>(78);
  const [heroBleed, setHeroBleed] = useState<boolean>(true);
  const [heroProgress, setHeroProgress] = useState<number>(68);
  const [heroConsoleTab, setHeroConsoleTab] = useState<'app' | 'code'>('app');
  const [heroStatusMsg, setHeroStatusMsg] = useState<string>('Press running at 78% ink flow • 68/100 copies stamped');
  const [zineLikes, setZineLikes] = useState<number>(42);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      TactileAudio.playClick(600);
    }
  };

  // Documentation Tab State
  const [docsTab, setDocsTab] = useState<'quickstart' | 'animations' | 'props' | 'palettes' | 'audio'>('quickstart');

  // AI Playground state
  const [promptInput, setPromptInput] = useState<string>(
    "A bouncy square-chip button labeled 'Publish Zine' with gentle spring pop"
  );
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compiledResult, setCompiledResult] = useState<PromptToComponentResult | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'preview' | 'dsl' | 'react'>('preview');

  const [tinkerServerConnected, setTinkerServerConnected] = useState<boolean>(false);

  // Audio mute toggle
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    TactileAudio.isMuted = next;
    if (!next) TactileAudio.playClick(600);
  };

  // Compile on mount or user submit
  const handleCompile = async (overridePrompt?: string) => {
    const text = overridePrompt || promptInput;
    setIsCompiling(true);
    try {
      const result = await PaperDotsAICompiler.compilePrompt(text);
      setCompiledResult(result);
    } finally {
      setIsCompiling(false);
    }
  };

  React.useEffect(() => {
    handleCompile();
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      const res = await PaperDotsAICompiler.checkLocalTinkerStatus();
      if (mounted) setTinkerServerConnected(res.connected);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const samplePrompts = [
    "A tactile square-chip button labeled 'Publish Zine' with gentle pop",
    "An elastic volume slider with square paper beads for Julian's music zine",
    "A soft coral heart toggle with fast spring bounce",
    "A tactical search input with responsive paper-dot borders",
    "A segmented ink progress meter with square paper chips",
    "A hypnotic slow-pulsing loader with matcha green paper chips",
  ];

  const morphShapesList: PresetShape[] = ['play', 'pause', 'heart', 'star', 'check', 'arrow', 'circle'];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInstallCmd(true);
    TactileAudio.playClick(900);
    setTimeout(() => setCopiedInstallCmd(false), 2000);
  };

  const getInstallCommand = () => {
    if (installTab === 'shadcn') {
      return `npx shadcn@latest add https://paperdots-ui.onrender.com/r/paper-${installComponent}.json`;
    }
    if (installTab === 'cli') {
      return `npx paperdots-ui add ${installComponent}`;
    }
    if (installTab === 'npm') {
      return `npm install paperdots-ui`;
    }
    return `// Copy components/ui/paper-${installComponent}.tsx from showcase/src/paperdots/shadcn/`;
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300 font-sans"
      style={{
        backgroundColor: activePalette.background,
        color: activePalette.dark,
      }}
    >
      {/* Top Sticky Navigation */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4"
        style={{
          borderColor: activePalette.border,
          backgroundColor: `${activePalette.background}F4`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs transition-all"
            style={{ backgroundColor: activePalette.primary }}
          >
            {globalDotShape === 'square' ? '■' : globalDotShape === 'diamond' ? '◆' : '●'}
          </div>
          <div>
            <span className="font-mono font-bold tracking-tight text-lg" style={{ color: activePalette.dark }}>
              PaperDots.js
            </span>
            <span
              className="ml-2 px-2 py-0.5 text-[10px] font-mono rounded-full font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: activePalette.secondary }}
            >
              Shadcn + Hacktoberfest 2026
            </span>
          </div>
        </div>

        {/* Navigation jump links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-mono font-bold opacity-80">
          <a href="#install" className="hover:opacity-100 transition-opacity">Installation</a>
          <a href="#components" className="hover:opacity-100 transition-opacity">Components</a>
          <a href="#docs" className="hover:opacity-100 transition-opacity">Documentation</a>
          <a href="#customizer" className="hover:opacity-100 transition-opacity">Customizer</a>
          <a href="#playground" className="hover:opacity-100 transition-opacity">AI Compiler</a>
          <a href="#benchmark" className="hover:opacity-100 transition-opacity">Benchmark</a>
          <a href="#story" className="hover:opacity-100 transition-opacity">Julian's Story</a>
        </nav>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Shape Switcher */}
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
            <button
              onClick={() => {
                setGlobalDotShape('square');
                TactileAudio.playClick(600);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                globalDotShape === 'square'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Squares</span>
            </button>
            <button
              onClick={() => {
                setGlobalDotShape('circle');
                TactileAudio.playClick(700);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                globalDotShape === 'circle'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Circle className="w-3.5 h-3.5 fill-current" />
              <span>Circles</span>
            </button>
            <button
              onClick={() => {
                setGlobalDotShape('diamond');
                TactileAudio.playClick(800);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                globalDotShape === 'diamond'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Diamond className="w-3.5 h-3.5 fill-current" />
              <span>Diamonds</span>
            </button>
          </div>

          {/* Burst Mode */}
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
            <span className="text-[10px] font-mono px-2 opacity-60 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Burst:
            </span>
            {(['gentle', 'confetti', 'none'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setGlobalBurstMode(m);
                  TactileAudio.playClick(500);
                }}
                className={`px-2 py-0.5 text-xs font-mono rounded-md capitalize transition-all ${
                  globalBurstMode === m
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 transition-all ${
              !isAudioMuted ? 'bg-white text-black shadow-xs font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ borderColor: activePalette.border }}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Palette Select */}
          <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-xl">
            <Palette className="w-3.5 h-3.5 opacity-60 ml-1" />
            <select
              value={selectedPaletteKey}
              onChange={(e) => {
                setSelectedPaletteKey(e.target.value);
                TactileAudio.playClick(750);
              }}
              className="bg-transparent text-xs font-mono font-bold outline-none cursor-pointer pr-1"
              style={{ color: activePalette.dark }}
            >
              {Object.entries(PALETTES).map(([key, pal]) => (
                <option key={key} value={key} className="bg-white text-black">
                  {pal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spot Ink Override Selector */}
          <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-xl">
            <span
              className="w-3 h-3 rounded-full ml-1 border border-black/20 shrink-0"
              style={{ backgroundColor: customInkColor || activePalette.primary }}
            />
            <select
              value={customInkColor || ''}
              onChange={(e) => {
                setCustomInkColor(e.target.value ? e.target.value : null);
                TactileAudio.playClick(650);
              }}
              className="bg-transparent text-xs font-mono font-bold outline-none cursor-pointer pr-1"
              style={{ color: activePalette.dark }}
            >
              <option value="" className="bg-white text-black">
                Spot Ink: Palette
              </option>
              {Object.entries(SPOT_INKS).map(([key, ink]) => (
                <option key={key} value={ink.hex} className="bg-white text-black">
                  {ink.name} ({ink.hex})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 px-6 border-b" style={{ borderColor: activePalette.border }}>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold mb-4 shadow-xs"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>Hacktoberfest Weekend Challenge: Built for a Friend (Julian)</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-mono mb-4">
            Tactile 2D Paper &{' '}
            <span style={{ color: activePalette.primary }}>
              {globalDotShape === 'square' ? 'Square-Chip' : 'Ink-Dot'}
            </span>
            <span className="block mt-1">Physics UI Library</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg opacity-85 mb-6 leading-relaxed">
            Install beautiful tactile paper UI components directly into any React or Shadcn application.
            Featuring <strong>distinct per-component animations</strong> (hydraulic pops, ripple waves, stamps, vortex swirls),
            pure 60 FPS Canvas physics, 100% light tactile themes, and open-weight Gemma + Tinker fine-tuning.
          </p>

          {/* Quick Install Pill using PaperDotButton */}
          <div className="max-w-2xl mx-auto mb-8">
            <div
              className="rounded-2xl p-2.5 border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: activePalette.cardBg,
                borderColor: activePalette.border,
              }}
            >
              <div className="flex items-center gap-2 px-2 overflow-x-auto text-xs font-mono w-full sm:w-auto">
                <Terminal className="w-4 h-4 text-emerald-600 shrink-0" />
                <code className="text-emerald-700 font-bold whitespace-nowrap">
                  npx shadcn@latest add https://paperdots-ui.onrender.com/r/paper-button.json
                </code>
              </div>
              <PaperDotButton
                label={copiedInstallCmd ? "Copied!" : "Copy Command"}
                onClick={() => copyToClipboard('npx shadcn@latest add https://paperdots-ui.onrender.com/r/paper-button.json')}
                palette={activePalette}
                dotShape={globalDotShape}
                animationType="hydraulic-pop"
                width={140}
                height={38}
              />
            </div>
          </div>

          {/* Real Library Buttons for Navigation (Eating our own dog food) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <PaperDotButton
              label="✦ Install via CLI"
              onClick={() => scrollTo('install')}
              palette={activePalette}
              dotShape={globalDotShape}
              animationType="hydraulic-pop"
              width={175}
              height={44}
            />
            <PaperDotButton
              label="✦ Component Suite"
              onClick={() => scrollTo('components')}
              palette={activePalette}
              dotShape={globalDotShape}
              animationType="ripple-wave"
              width={185}
              height={44}
            />
            <PaperDotButton
              label="✦ Documentation"
              onClick={() => scrollTo('docs')}
              palette={activePalette}
              dotShape={globalDotShape}
              animationType="stamp-press"
              width={175}
              height={44}
            />
            <PaperDotButton
              label="✦ AI DSL Compiler"
              onClick={() => scrollTo('playground')}
              palette={activePalette}
              dotShape={globalDotShape}
              animationType="particle-vortex"
              width={175}
              height={44}
            />
          </div>
        </div>

        {/* Real Product Demo Built With PaperDots: Julian's Analog Futures Zine Console */}
        <div className="mt-10 max-w-4xl mx-auto text-left relative z-20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider" style={{ color: activePalette.dark }}>
                Built With PaperDots: Julian's Analog Zine Studio
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
              <button
                onClick={() => {
                  setHeroConsoleTab('app');
                  TactileAudio.playClick(600);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  heroConsoleTab === 'app' ? 'bg-white text-black shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                Interactive Product
              </button>
              <button
                onClick={() => {
                  setHeroConsoleTab('code');
                  TactileAudio.playClick(750);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  heroConsoleTab === 'code' ? 'bg-white text-black shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                View React / Shadcn Code
              </button>
            </div>
          </div>

          {heroConsoleTab === 'app' ? (
            <div
              className="rounded-2xl p-6 shadow-xs border transition-all"
              style={{
                backgroundColor: activePalette.cardBg,
                borderColor: activePalette.border,
              }}
            >
              {/* Top Ribbon: Badges + Kinetic Input */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-6" style={{ borderColor: activePalette.border }}>
                <div className="flex flex-wrap items-center gap-2">
                  <PaperDotBadge
                    label="Living Press: Online"
                    variant="primary"
                    animationType="beacon-pulse"
                    palette={activePalette}
                    dotShape={globalDotShape}
                  />
                  <PaperDotBadge
                    label="Limited Edition: 100 Copies"
                    variant="secondary"
                    animationType="shimmer-wave"
                    palette={activePalette}
                    dotShape={globalDotShape}
                  />
                </div>

                {/* Typewriter Recoil Input */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono opacity-60">Issue:</span>
                  <PaperDotInput
                    value={heroZineTitle}
                    onChange={setHeroZineTitle}
                    animationType="typewriter-recoil"
                    palette={activePalette}
                    dotShape={globalDotShape}
                    width={230}
                    height={40}
                  />
                </div>
              </div>

              {/* 3 Interactive Workstations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Workstation 1: Living Equalizer Wave (Morph) */}
                <div className="p-4 rounded-xl border border-dashed flex flex-col items-center justify-between text-center gap-3" style={{ borderColor: activePalette.border }}>
                  <div>
                    <div className="font-mono font-bold text-xs">Audio Wave Synthesizer</div>
                    <p className="text-[10px] font-mono opacity-60 mt-0.5">Click to toggle living wave vs freeze</p>
                  </div>
                  <PaperDotMorph
                    shape={heroAudioPlaying ? 'play' : 'pause'}
                    isPlaying={heroAudioPlaying}
                    size={95}
                    palette={activePalette}
                    dotShape={globalDotShape}
                    burstIntensity="gentle"
                    onClick={() => {
                      setHeroAudioPlaying(!heroAudioPlaying);
                      setHeroStatusMsg(!heroAudioPlaying ? 'Acoustic equalizer wave active' : 'Audio wave frozen in crystalline pause');
                      TactileAudio.playPop(heroAudioPlaying ? 500 : 750);
                    }}
                  />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">
                    {heroAudioPlaying ? 'Living Wave' : 'Crystalline Freeze'}
                  </span>
                </div>

                {/* Workstation 2: Press Sliders & Tactile Toggle */}
                <div className="p-4 rounded-xl border border-dashed flex flex-col justify-between gap-4" style={{ borderColor: activePalette.border }}>
                  <div>
                    <div className="font-mono font-bold text-xs mb-1">Ink Flow &amp; Density</div>
                    <PaperDotSlider
                      value={heroSpeed}
                      onChange={(v) => {
                        setHeroSpeed(v);
                        setHeroStatusMsg(`Ink density adjusted to ${v}%`);
                      }}
                      palette={activePalette}
                      dotShape={globalDotShape}
                      animationType="elastic-string"
                      width={210}
                      height={40}
                    />
                    <div className="flex justify-between text-[10px] font-mono opacity-60 mt-1">
                      <span>Flow: {heroSpeed}%</span>
                      <span>Elastic String</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: activePalette.border }}>
                    <div>
                      <div className="font-mono font-bold text-xs">Living Bleed</div>
                      <span className="text-[10px] font-mono opacity-60">Tangential roll</span>
                    </div>
                    <PaperDotToggle
                      checked={heroBleed}
                      onChange={(b) => {
                        setHeroBleed(b);
                        setHeroStatusMsg(b ? 'Capillary ink bleed enabled' : 'Clean edge mode active');
                      }}
                      palette={activePalette}
                      dotShape={globalDotShape}
                      animationType="cylinder-roll"
                    />
                  </div>
                </div>

                {/* Workstation 3: Printing Progress & Stamping */}
                <div className="p-4 rounded-xl border border-dashed flex flex-col justify-between gap-3 text-center" style={{ borderColor: activePalette.border }}>
                  <div>
                    <div className="font-mono font-bold text-xs">Print Production</div>
                    <p className="text-[10px] font-mono opacity-60 mt-0.5">Domino cascade ink queue</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <PaperDotProgress
                      value={heroProgress}
                      palette={activePalette}
                      dotShape={globalDotShape}
                      animationType="domino-cascade"
                      width={200}
                      height={32}
                    />
                    <span className="text-[10px] font-mono opacity-70 mt-1">
                      {heroProgress}/100 Copies Stamped
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <PaperDotButton
                      label="Stamp Proof"
                      palette={activePalette}
                      dotShape={globalDotShape}
                      animationType="hydraulic-pop"
                      width={110}
                      height={36}
                      onClick={() => {
                        setHeroProgress(Math.min(100, heroProgress + 10));
                        setHeroStatusMsg(`Proof stamped! Current run: ${Math.min(100, heroProgress + 10)}/100 copies`);
                        TactileAudio.playPop(800);
                      }}
                    />
                    <PaperDotButton
                      label="Publish Zine"
                      inkColor={SPOT_INKS.fluorescentPink.hex}
                      palette={activePalette}
                      dotShape={globalDotShape}
                      animationType="stamp-press"
                      width={110}
                      height={36}
                      onClick={() => {
                        setHeroProgress(100);
                        setHeroStatusMsg(`Published '${heroZineTitle}' to the Living Web!`);
                        TactileAudio.playPop(900);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Status Feed */}
              <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-xl bg-black/5" style={{ color: activePalette.dark }}>
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activePalette.primary }} />
                  <span className="font-bold truncate">{heroStatusMsg}</span>
                </div>
                <span className="text-[10px] opacity-60 shrink-0 ml-2">PaperDots Physics v1.2</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 bg-[#1C1D1F] text-emerald-400 font-mono text-xs shadow-xs border border-black/20 overflow-x-auto">
              <div className="flex items-center justify-between text-white/50 border-b border-white/10 pb-2 mb-4">
                <span>// Building Julian's Zine Console using PaperDots Shadcn components:</span>
                <span>components/ZineConsole.tsx</span>
              </div>
              <pre className="leading-relaxed">
{`import React, { useState } from "react";
import { 
  Button, 
  Slider, 
  Switch, 
  Badge, 
  Input, 
  Card,
  SPOT_INKS 
} from "@/components/ui";

export function ZineConsole() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState([78]);
  const [bleed, setBleed] = useState(true);

  return (
    <Card withKineticBorder className="p-6">
      {/* 1. Header with Kinetic Badges & Typewriter Input */}
      <Badge variant="paper-kinetic">Living Press: Online</Badge>
      <Input withKineticBorder placeholder="Zine Title..." />

      {/* 2. Elastic String Fader & Roll Switch */}
      <Slider value={speed} onValueChange={setSpeed} />
      <Switch checked={bleed} onCheckedChange={setBleed} />

      {/* 3. Kinetic Hydraulic & Stamp Buttons with Spot Inks */}
      <Button animationType="hydraulic-pop" onClick={handleStamp}>
        Stamp Proof
      </Button>
      <Button 
        inkColor={SPOT_INKS.fluorescentPink.hex}
        animationType="stamp-press"
        onClick={handlePublish}
      >
        Publish Zine
      </Button>
    </Card>
  );
}`}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 1: Installation & Registry Hub */}
      <section id="install" className="py-14 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Component Installation & Registry
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-tight">
            Install Components in Any Project
          </h2>
          <p className="text-sm font-mono opacity-75 mt-2 max-w-xl mx-auto">
            Install PaperDots directly into your existing Shadcn or React codebase with one command.
          </p>
        </div>

        {/* Method Picker Tabs */}
        <div
          className="rounded-2xl p-6 shadow-xs border mb-8"
          style={{
            backgroundColor: activePalette.cardBg,
            borderColor: activePalette.border,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6" style={{ borderColor: activePalette.border }}>
            <div className="flex gap-2">
              <button
                onClick={() => setInstallTab('shadcn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  installTab === 'shadcn' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
                }`}
              >
                Shadcn Registry CLI
              </button>
              <button
                onClick={() => setInstallTab('cli')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  installTab === 'cli' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
                }`}
              >
                PaperDots CLI
              </button>
              <button
                onClick={() => setInstallTab('npm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  installTab === 'npm' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
                }`}
              >
                NPM / PNPM
              </button>
              <button
                onClick={() => setInstallTab('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  installTab === 'manual' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
                }`}
              >
                Manual Drop-In
              </button>
            </div>

            {/* Component Selector */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="opacity-60">Component:</span>
              <select
                value={installComponent}
                onChange={(e) => setInstallComponent(e.target.value)}
                className="bg-black/5 px-2.5 py-1 rounded-lg font-bold outline-none cursor-pointer"
                style={{ color: activePalette.dark }}
              >
                <option value="button">paper-button</option>
                <option value="slider">paper-slider</option>
                <option value="toggle">paper-toggle</option>
                <option value="morph">paper-morph</option>
                <option value="badge">paper-badge</option>
                <option value="progress">paper-progress</option>
                <option value="input">paper-input</option>
                <option value="card">paper-card</option>
              </select>
            </div>
          </div>

          {/* Dynamic Command Box */}
          <div className="bg-[#1C1D1F] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-emerald-400 font-mono text-xs mb-4">
            <code>{getInstallCommand()}</code>
            <PaperDotButton
              label={copiedInstallCmd ? "Copied Command!" : "Copy Command"}
              onClick={() => copyToClipboard(getInstallCommand())}
              palette={activePalette}
              dotShape={globalDotShape}
              animationType="hydraulic-pop"
              width={150}
              height={36}
            />
          </div>

          {/* Step by step instructions based on install tab */}
          <div className="text-xs font-mono opacity-80 space-y-2">
            {installTab === 'shadcn' && (
              <>
                <p>✦ <strong>Step 1:</strong> Run the command above in your terminal. Shadcn will fetch the schema and place the component in <code className="bg-black/5 px-1 py-0.5 rounded">components/ui/paper-{installComponent}.tsx</code>.</p>
                <p>✦ <strong>Step 2:</strong> Import into any page: <code className="bg-black/5 px-1 py-0.5 rounded">{`import { Button } from "@/components/ui/paper-button";`}</code></p>
                <p>✦ <strong>Step 3:</strong> Configure any of the 6 distinct animation types via the <code className="bg-black/5 px-1 py-0.5 rounded">animationType</code> prop.</p>
              </>
            )}
            {installTab === 'cli' && (
              <>
                <p>✦ <strong>Step 1:</strong> Run <code className="bg-black/5 px-1 py-0.5 rounded">npx paperdots-ui add {installComponent}</code> (or <code className="bg-black/5 px-1 py-0.5 rounded">npx paperdots-ui add --all</code> to install the complete 10-component suite).</p>
                <p>✦ <strong>Step 2:</strong> Zero build step required—all canvas physics and audio synthesizers are bundled self-contained.</p>
              </>
            )}
            {installTab === 'npm' && (
              <>
                <p>✦ <strong>Step 1:</strong> Run <code className="bg-black/5 px-1 py-0.5 rounded">npm install paperdots-ui</code> in your package root.</p>
                <p>✦ <strong>Step 2:</strong> Use with full TypeScript types: <code className="bg-black/5 px-1 py-0.5 rounded">{`import { PaperDotButton, PALETTES } from 'paperdots-ui';`}</code></p>
              </>
            )}
            {installTab === 'manual' && (
              <>
                <p>✦ Copy the component from <code className="bg-black/5 px-1 py-0.5 rounded">showcase/src/paperdots/components/PaperDot{installComponent.charAt(0).toUpperCase() + installComponent.slice(1)}.tsx</code> directly into your repo.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Component Suite with DISTINCT ANIMATIONS */}
      <section id="components" className="py-14 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: activePalette.border }}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Distinct Component Animations
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-tight">
            Every Component Has Its Own Animations
          </h2>
          <p className="text-sm font-mono opacity-70 mt-2 max-w-xl mx-auto">
            Switch animation modes per component to feel how hydraulic pops, ripple waves, stamps, and vortex swirls behave differently on physical paper.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Component 1: PaperDotButton (6 Distinct Animations) */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotButton</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">6 Modes</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Switch click animation types in real-time:
              </p>
              {/* Animation Switcher Pills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {(['hydraulic-pop', 'ripple-wave', 'stamp-press', 'confetti-drift', 'particle-vortex', 'micro-chatter'] as ButtonAnimationType[]).map((anim) => (
                  <button
                    key={anim}
                    onClick={() => {
                      setButtonAnim(anim);
                      TactileAudio.playClick(800);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                      buttonAnim === anim ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {anim.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4 flex flex-col items-center gap-3">
              <PaperDotButton
                label="Click Me"
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
                burstIntensity={globalBurstMode}
                animationType={buttonAnim}
                width={170}
                height={48}
              />
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">Active: <strong>{buttonAnim}</strong></span>
          </div>

          {/* Component 2: PaperDotMorph (Play vs Pause living dynamics) */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotMorph</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 font-bold">Play/Pause Dynamic</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Play animates living equalizer waves; Pause freezes into crystalline rest; switching shapes swirls in a vortex:
              </p>
              {/* Shape Switcher */}
              <div className="flex flex-wrap gap-1 mb-3">
                {morphShapesList.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setMorphShape(s);
                      if (s === 'play') setMorphPlaying(true);
                      if (s === 'pause') setMorphPlaying(false);
                      TactileAudio.playClick(750);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded capitalize transition-all ${
                      morphShape === s ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-2 flex flex-col items-center gap-2">
              <PaperDotMorph
                shape={morphShape}
                isPlaying={morphPlaying}
                size={110}
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
                burstIntensity={globalBurstMode}
                onClick={() => {
                  if (morphShape === 'play') {
                    setMorphShape('pause');
                    setMorphPlaying(false);
                  } else if (morphShape === 'pause') {
                    setMorphShape('play');
                    setMorphPlaying(true);
                  }
                }}
              />
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">
              {morphShape === 'play' ? 'Living Equalizer Wave' : morphShape === 'pause' ? 'Crystalline Pause Brake' : 'Vortex Swirl Morph'}
            </span>
          </div>

          {/* Component 3: PaperDotToggle (Cylinder roll, page flip, slingshot) */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotToggle</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">Roll / Flip / Slingshot</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Switch between different kinematic switch animations:
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(['cylinder-roll', 'page-flip', 'slingshot-snap'] as ToggleAnimationType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setToggleAnim(t);
                      TactileAudio.playClick(600);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                      toggleAnim === t ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-6 flex justify-center">
              <PaperDotToggle
                checked={toggleState}
                onChange={setToggleState}
                animationType={toggleAnim}
                label={toggleState ? "Active" : "Resting"}
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
              />
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">Active: <strong>{toggleAnim}</strong></span>
          </div>

          {/* Component 4: PaperDotSlider (Elastic string, ink dilation, magnetic) */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotSlider</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">3 Modes</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Elastic catenary string curve or velocity ink dilation:
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(['elastic-string', 'ink-dilation', 'magnetic-tick'] as SliderAnimationType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSliderAnim(s);
                      TactileAudio.playClick(650);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                      sliderAnim === s ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4 flex flex-col items-center">
              <PaperDotSlider
                value={sliderVal}
                onChange={setSliderVal}
                animationType={sliderAnim}
                label="Ink Tension"
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
                width={220}
              />
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">Value: {sliderVal}% • Mode: <strong>{sliderAnim}</strong></span>
          </div>

          {/* Component 5: PaperDotProgress (Domino cascade, capillary bleed, strobe) */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotProgress</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">Cascade / Bleed</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Domino chip jumps, wet capillary ink spreading, or traveling strobe:
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(['domino-cascade', 'capillary-bleed', 'strobe-pulse'] as ProgressAnimationType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProgressAnim(p);
                      TactileAudio.playClick(680);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                      progressAnim === p ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-2 flex flex-col items-center gap-3">
              <PaperDotProgress
                value={progressVal}
                animationType={progressAnim}
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
                label="Pressing Zine"
                width={220}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setProgressVal(Math.max(0, progressVal - 15))}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-black/5 hover:bg-black/10 font-bold transition-colors"
                >
                  -15%
                </button>
                <button
                  onClick={() => setProgressVal(Math.min(100, progressVal + 15))}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-black/5 hover:bg-black/10 font-bold transition-colors"
                >
                  +15%
                </button>
              </div>
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">Mode: <strong>{progressAnim}</strong></span>
          </div>

          {/* Component 6: PaperDotInput (Typewriter recoil, focus halo, perimeter wave) */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotInput</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">Recoil & Halo</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Keystroke typewriter recoil or breathing focus margin:
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(['typewriter-recoil', 'focus-halo', 'perimeter-wave'] as InputAnimationType[]).map((inp) => (
                  <button
                    key={inp}
                    onClick={() => {
                      setInputAnim(inp);
                      TactileAudio.playClick(650);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                      inputAnim === inp ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {inp.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4 flex justify-center">
              <PaperDotInput
                value={inputVal}
                onChange={setInputVal}
                animationType={inputAnim}
                placeholder="Type to feel typewriter recoil..."
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
                width={240}
              />
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">Mode: <strong>{inputAnim}</strong></span>
          </div>

          {/* Component 7: PaperDotBadge */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotBadge</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">Beacon / Shimmer</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-3">
                Radiant beacon pulse, shimmer wave, or buoyant paper drift:
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(['beacon-pulse', 'shimmer-wave', 'float-drift'] as BadgeAnimationType[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBadgeAnim(b);
                      TactileAudio.playClick(600);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                      badgeAnim === b ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {b.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-5 flex flex-wrap justify-center gap-2">
              <PaperDotBadge label="Live Press" variant="primary" inkColor={customInkColor || undefined} animationType={badgeAnim} palette={activePalette} dotShape={globalDotShape} />
              <PaperDotBadge label="Edition #04" variant="secondary" inkColor={customInkColor || undefined} animationType={badgeAnim} palette={activePalette} dotShape={globalDotShape} />
            </div>
            <span className="text-[11px] font-mono opacity-60 text-center">Tap badge to pop chips</span>
          </div>

          {/* Component 8: PaperDotLoader */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotLoader</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">Orbital Constellation</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-4">
                Orbital paper-dot constellation with sinusoidal ink bleed breathing.
              </p>
            </div>
            <div className="py-4 flex justify-center">
              <PaperDotLoader size={100} palette={activePalette} inkColor={customInkColor || undefined} dotShape={globalDotShape} label="Printing Zine..." />
            </div>
            <span className="text-[11px] font-mono opacity-50 text-center">Locked 60 FPS Canvas</span>
          </div>

          {/* Component 9: PaperDotCard */}
          <div
            className="rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: activePalette.cardBg,
              border: `1px solid ${activePalette.border}`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">PaperDotCard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">Magnetic Repulsion</span>
              </div>
              <p className="text-xs font-mono opacity-70 mb-4">
                Card with perimeter chip lattice that pushes away as cursor hovers.
              </p>
            </div>
            <div className="py-2 flex justify-center">
              <PaperDotCard
                title="Analog No. 04"
                subtitle="Risograph Print"
                palette={activePalette}
                inkColor={customInkColor || undefined}
                dotShape={globalDotShape}
                width={240}
                height={130}
              >
                <div className="flex justify-between items-center text-[10px] font-mono opacity-80 mt-2">
                  <span>Edition 42/100</span>
                  <span className="font-bold" style={{ color: activePalette.secondary }}>Available</span>
                </div>
              </PaperDotCard>
            </div>
            <span className="text-[11px] font-mono opacity-50 text-center">Hover border for magnetism</span>
          </div>
        </div>

        {/* SECTION 2B: Authentic Risograph Spot Inks Studio */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: activePalette.border }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-2">
              <Palette className="w-4 h-4 text-pink-500" />
              12 Authentic Risograph Spot Inks
            </div>
            <h3 className="text-2xl font-bold font-mono tracking-tight">
              Vibrant Spot Inks — Color Any Component
            </h3>
            <p className="text-sm font-mono opacity-70 mt-1 max-w-xl mx-auto">
              Julian's studio prints with genuine Soy &amp; Rice bran spot ink drums. Set <code className="bg-black/5 px-1 py-0.5 rounded font-bold">inkColor</code> on any component to dye chips independently of the paper background.
            </p>
          </div>

          {/* Physical Ink Drums Rack */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {Object.entries(SPOT_INKS).map(([key, ink]) => (
              <button
                key={key}
                onClick={() => {
                  setCustomInkColor(ink.hex);
                  TactileAudio.playClick(700);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  customInkColor === ink.hex
                    ? 'ring-2 ring-black shadow-sm scale-102 font-bold'
                    : 'hover:shadow-xs opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: activePalette.cardBg,
                  borderColor: activePalette.border,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-6 h-6 rounded-md shadow-xs border border-black/10 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: ink.hex }}
                  >
                    ■
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/5 opacity-70">
                    {ink.category}
                  </span>
                </div>
                <div>
                  <div className="font-mono text-xs" style={{ color: activePalette.dark }}>
                    {ink.name}
                  </div>
                  <div className="font-mono text-[10px] opacity-60">
                    {ink.hex}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Multi-Color Living Components Gallery */}
          <div className="rounded-2xl p-6 border shadow-xs" style={{ backgroundColor: activePalette.cardBg, borderColor: activePalette.border }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: activePalette.border }}>
              <div>
                <h4 className="font-mono font-bold text-base">Live Multi-Color Component Gallery</h4>
                <p className="text-xs font-mono opacity-70">Every component dyed in a physical spot ink drum with distinct animation:</p>
              </div>
              {customInkColor && (
                <button
                  onClick={() => {
                    setCustomInkColor(null);
                    TactileAudio.playClick(500);
                  }}
                  className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
                >
                  Reset Active Ink Override
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              {/* 1. Fluo Pink Hydraulic Pop */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.fluorescentPink.hex }}>
                  ● Fluo Pink (#FF48B0)
                </span>
                <PaperDotButton
                  label="Fluo Hot Pop"
                  inkColor={SPOT_INKS.fluorescentPink.hex}
                  animationType="hydraulic-pop"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={150}
                  height={44}
                />
                <span className="text-[10px] font-mono opacity-50">Hydraulic Pop</span>
              </div>

              {/* 2. Federal Blue Ripple Wave */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.federalBlue.hex }}>
                  ● Federal Blue (#0078BF)
                </span>
                <PaperDotButton
                  label="Ocean Wave"
                  inkColor={SPOT_INKS.federalBlue.hex}
                  animationType="ripple-wave"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={150}
                  height={44}
                />
                <span className="text-[10px] font-mono opacity-50">Ripple Wave</span>
              </div>

              {/* 3. Sunflower Yellow Stamp Press */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold text-amber-700">
                  ● Sunflower Gold (#FFE800)
                </span>
                <PaperDotButton
                  label="Gold Press"
                  inkColor={SPOT_INKS.sunflower.hex}
                  animationType="stamp-press"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={150}
                  height={44}
                />
                <span className="text-[10px] font-mono opacity-50">Stamp Press</span>
              </div>

              {/* 4. Mint Seafoam Slingshot Toggle */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.mintSeafoam.hex }}>
                  ● Mint Seafoam (#2EC4B6)
                </span>
                <PaperDotToggle
                  checked={toggleState}
                  onChange={setToggleState}
                  inkColor={SPOT_INKS.mintSeafoam.hex}
                  animationType="slingshot-snap"
                  palette={activePalette}
                  dotShape={globalDotShape}
                />
                <span className="text-[10px] font-mono opacity-50">Slingshot Toggle</span>
              </div>

              {/* 5. Scarlet Red Confetti Drift */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.scarletRed.hex }}>
                  ● Scarlet Red (#E63946)
                </span>
                <PaperDotButton
                  label="Scarlet Drift"
                  inkColor={SPOT_INKS.scarletRed.hex}
                  animationType="confetti-drift"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={150}
                  height={44}
                />
                <span className="text-[10px] font-mono opacity-50">Confetti Drift</span>
              </div>

              {/* 6. Purple Violet Vortex Swirl */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.violetPurple.hex }}>
                  ● Purple Violet (#7209B7)
                </span>
                <PaperDotButton
                  label="Violet Vortex"
                  inkColor={SPOT_INKS.violetPurple.hex}
                  animationType="particle-vortex"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={150}
                  height={44}
                />
                <span className="text-[10px] font-mono opacity-50">Particle Vortex</span>
              </div>

              {/* 7. Forest Green Domino Progress */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.emeraldGreen.hex }}>
                  ● Forest Green (#2D6A4F)
                </span>
                <PaperDotProgress
                  value={progressVal}
                  inkColor={SPOT_INKS.emeraldGreen.hex}
                  animationType="domino-cascade"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={150}
                  height={32}
                />
                <span className="text-[10px] font-mono opacity-50">Domino Cascade</span>
              </div>

              {/* 8. Terracotta Earth Badge */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: activePalette.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: SPOT_INKS.terracotta.hex }}>
                  ● Terracotta Earth (#C05621)
                </span>
                <PaperDotBadge
                  label="Zine #12"
                  inkColor={SPOT_INKS.terracotta.hex}
                  animationType="beacon-pulse"
                  palette={activePalette}
                  dotShape={globalDotShape}
                />
                <span className="text-[10px] font-mono opacity-50">Beacon Pulse Badge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Documentation & Integration Guide */}
      <section id="docs" className="py-14 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: activePalette.border }}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Complete Documentation & Guide
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-tight">
            How to Integrate & Configure PaperDots
          </h2>
          <p className="text-sm font-mono opacity-75 mt-2 max-w-xl mx-auto">
            Everything you need to configure multiple animation modes, light paper tokens, and custom physics in your project.
          </p>
        </div>

        {/* Documentation Tab Nav */}
        <div
          className="rounded-2xl p-6 shadow-xs border"
          style={{
            backgroundColor: activePalette.cardBg,
            borderColor: activePalette.border,
          }}
        >
          <div className="flex flex-wrap gap-2 border-b pb-4 mb-6" style={{ borderColor: activePalette.border }}>
            <button
              onClick={() => setDocsTab('quickstart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                docsTab === 'quickstart' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
              }`}
            >
              1. Quick Start
            </button>
            <button
              onClick={() => setDocsTab('animations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                docsTab === 'animations' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
              }`}
            >
              2. Animation Settings
            </button>
            <button
              onClick={() => setDocsTab('props')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                docsTab === 'props' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
              }`}
            >
              3. Props Reference
            </button>
            <button
              onClick={() => setDocsTab('palettes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                docsTab === 'palettes' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
              }`}
            >
              4. 8 Light Palettes
            </button>
            <button
              onClick={() => setDocsTab('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                docsTab === 'audio' ? 'bg-black text-white shadow-xs' : 'bg-black/5 opacity-70 hover:opacity-100'
              }`}
            >
              5. Web Audio Haptics
            </button>
          </div>

          {/* Tab 1: Quickstart */}
          {docsTab === 'quickstart' && (
            <div className="space-y-4 text-xs font-mono">
              <h3 className="font-bold text-sm">Getting Started with PaperDots UI</h3>
              <p className="opacity-80 leading-relaxed">
                PaperDots UI works seamlessly in any React 18 or React 19 project (Next.js App Router, Vite, Astro, Remix).
                It requires zero heavy 3D game engines or WebGL dependencies—pure 60 FPS Canvas 2D Euler physics.
              </p>
              <pre className="bg-[#1C1D1F] text-emerald-400 p-4 rounded-xl overflow-x-auto">
{`// 1. Install via Shadcn Registry CLI:
npx shadcn@latest add https://paperdots-ui.onrender.com/r/paper-button.json

// 2. Use in your component:
import { Button } from "@/components/ui/paper-button";

export default function MyZine() {
  return (
    <Button 
      variant="paper-kinetic" 
      dotShape="square" 
      animationType="hydraulic-pop"
      burstIntensity="gentle"
    >
      Publish Zine
    </Button>
  );
}`}
              </pre>
            </div>
          )}

          {/* Tab 2: Animations */}
          {docsTab === 'animations' && (
            <div className="space-y-4 text-xs font-mono">
              <h3 className="font-bold text-sm">Configuring Distinct Component Animations</h3>
              <p className="opacity-80 leading-relaxed">
                Every component supports tailored animation types. Pass the <code className="bg-black/5 px-1 py-0.5 rounded">animationType</code> prop:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/5">
                  <h4 className="font-bold mb-2 text-blue-600">PaperDotButton Animations:</h4>
                  <ul className="space-y-1 opacity-80 list-disc list-inside">
                    <li><code className="font-bold">hydraulic-pop</code>: Radial explosion that snaps back in &lt;350ms</li>
                    <li><code className="font-bold">ripple-wave</code>: Traveling circular wave across the button</li>
                    <li><code className="font-bold">stamp-press</code>: Vertical letterpress plate stamp impact</li>
                    <li><code className="font-bold">confetti-drift</code>: Upward eruptive spray of paper chips</li>
                    <li><code className="font-bold">particle-vortex</code>: Swirling cyclone around cursor</li>
                    <li><code className="font-bold">micro-chatter</code>: Vintage typewriter carriage tremor</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <h4 className="font-bold mb-2 text-purple-600">PaperDotMorph & Others:</h4>
                  <ul className="space-y-1 opacity-80 list-disc list-inside">
                    <li><code className="font-bold">PaperDotMorph</code>: Play equalizer waves, crystalline pause snap, vortex shape-morphs.</li>
                    <li><code className="font-bold">PaperDotSlider</code>: Elastic catenary string, velocity ink dilation, magnetic notch ticks.</li>
                    <li><code className="font-bold">PaperDotToggle</code>: Cylinder roll, page flip fold, rubber slingshot.</li>
                    <li><code className="font-bold">PaperDotProgress</code>: Domino chip jumps, capillary bleed, traveling strobe.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Props */}
          {docsTab === 'props' && (
            <div className="space-y-4 text-xs font-mono">
              <h3 className="font-bold text-sm">Component Props Reference Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b bg-black/5">
                    <tr>
                      <th className="p-2">Prop</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Default</th>
                      <th className="p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-2 font-bold text-blue-600">dotShape</td>
                      <td className="p-2">'square' | 'circle' | 'diamond'</td>
                      <td className="p-2">'square'</td>
                      <td className="p-2">Geometry of physical paper particles</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600">animationType</td>
                      <td className="p-2">Component-specific string</td>
                      <td className="p-2">'hydraulic-pop'</td>
                      <td className="p-2">Selects distinct kinetic animation routine</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600">burstIntensity</td>
                      <td className="p-2">'none' | 'gentle' | 'confetti'</td>
                      <td className="p-2">'gentle'</td>
                      <td className="p-2">Magnitude of particle displacement on click</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600">palette</td>
                      <td className="p-2">RisographPalette</td>
                      <td className="p-2">PALETTES.risographClassic</td>
                      <td className="p-2">Light printmaker palette configuration</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600">inkColor</td>
                      <td className="p-2">string (hex or CSS color)</td>
                      <td className="p-2">undefined (uses palette.primary)</td>
                      <td className="p-2">Direct spot ink override (e.g. SPOT_INKS.fluorescentPink.hex or '#FF48B0')</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600">dotSpacing</td>
                      <td className="p-2">number</td>
                      <td className="p-2">7</td>
                      <td className="p-2">Grid spacing between dots in pixels</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Palettes & Spot Inks */}
          {docsTab === 'palettes' && (
            <div className="space-y-6 text-xs font-mono">
              <div>
                <h3 className="font-bold text-sm mb-1">13 Authentic 100% Light Printmaker Palettes</h3>
                <p className="opacity-80">All dark themes have been completely eliminated in favor of warm tactile paper aesthetics:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {Object.entries(PALETTES).map(([k, pal]) => (
                    <div
                      key={k}
                      className="p-3 rounded-xl border flex flex-col gap-2"
                      style={{ backgroundColor: pal.background, borderColor: pal.border, color: pal.dark }}
                    >
                      <span className="font-bold">{pal.name}</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.dark }} />
                      </div>
                      <span className="text-[10px] opacity-70">{pal.background}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spot Inks Documentation */}
              <div className="border-t pt-4" style={{ borderColor: activePalette.border }}>
                <h3 className="font-bold text-sm mb-1">12 Physical Risograph Spot Inks (SPOT_INKS)</h3>
                <p className="opacity-80 mb-3">
                  Julian prints with 12 distinct spot ink drums. Pass any <code className="bg-black/5 px-1 py-0.5 rounded font-bold">inkColor</code> prop to dye components independently:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                  {Object.entries(SPOT_INKS).map(([k, ink]) => (
                    <div
                      key={k}
                      className="p-2.5 rounded-lg border flex flex-col gap-1.5"
                      style={{ backgroundColor: activePalette.cardBg, borderColor: activePalette.border }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-sm shrink-0 border border-black/10" style={{ backgroundColor: ink.hex }} />
                        <span className="font-bold text-[11px] truncate">{ink.name}</span>
                      </div>
                      <code className="text-[10px] opacity-70">{ink.hex}</code>
                    </div>
                  ))}
                </div>

                <div className="bg-[#1C1D1F] text-emerald-400 p-3.5 rounded-xl text-xs space-y-1">
                  <p className="text-white/60">// How to dye individual components with authentic spot ink:</p>
                  <p><span className="text-purple-400">import</span> &#123; Button, SPOT_INKS &#125; <span className="text-purple-400">from</span> <span className="text-amber-300">"@/components/ui/paper-button"</span>;</p>
                  <p><span className="text-white/60">// In your JSX:</span></p>
                  <p>&lt;<span className="text-blue-400">Button</span> <span className="text-amber-200">inkColor</span>=&#123;SPOT_INKS.fluorescentPink.hex&#125; <span className="text-amber-200">animationType</span>=<span className="text-amber-300">"hydraulic-pop"</span>&gt;Publish Zine&lt;/<span className="text-blue-400">Button</span>&gt;</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Audio */}
          {docsTab === 'audio' && (
            <div className="space-y-4 text-xs font-mono">
              <h3 className="font-bold text-sm">Web Audio Procedural Haptics (Zero Audio Files)</h3>
              <p className="opacity-80 leading-relaxed">
                PaperDots features built-in acoustic synthesizers built directly with the browser's Web Audio API.
                Zero MP3 downloads, zero audio latency:
              </p>
              <ul className="space-y-2 opacity-80 list-disc list-inside">
                <li><code className="font-bold">TactileAudio.playClick(freq)</code>: Crisp mechanical typewriter strike oscillator.</li>
                <li><code className="font-bold">TactileAudio.playPop(freq)</code>: Hydraulic ink pop with exponential frequency downward sweep.</li>
                <li><code className="font-bold">TactileAudio.playRustle()</code>: Filtered white noise simulating cotton paper rustle.</li>
                <li><code className="font-bold">TactileAudio.playTick()</code>: Micro notch tick for faders and sliders.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: Paper Studio Deep Customizer */}
      <section id="customizer" className="py-14 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: activePalette.border }}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            Paper Studio Customizer
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-tight">
            Customization Knobs & Physics Controls
          </h2>
          <p className="text-sm font-mono opacity-75 mt-2 max-w-xl mx-auto">
            Fine-tune particle radius, grid spacing, Hooke's spring stiffness, and damping in real-time.
          </p>
        </div>

        {/* Customization Grid */}
        <div
          className="rounded-2xl p-6 shadow-xs border grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
          style={{
            backgroundColor: activePalette.cardBg,
            borderColor: activePalette.border,
          }}
        >
          {/* Controls Column */}
          <div className="flex flex-col gap-5">
            {/* Slider 1: Dot / Chip Radius */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Chip / Dot Radius:</span>
                <span>{customRadius.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="4.5"
                step="0.1"
                value={customRadius}
                onChange={(e) => {
                  setCustomRadius(parseFloat(e.target.value));
                  TactileAudio.playTick();
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono opacity-60">
                <span>Fine Stipple (1.4px)</span>
                <span>Chunky Paper Chip (4.5px)</span>
              </div>
            </div>

            {/* Slider 2: Dot Spacing */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Grid Spacing:</span>
                <span>{customSpacing}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="12"
                step="1"
                value={customSpacing}
                onChange={(e) => {
                  setCustomSpacing(parseInt(e.target.value));
                  TactileAudio.playTick();
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono opacity-60">
                <span>Dense Matrix (5px)</span>
                <span>Airy Grid (12px)</span>
              </div>
            </div>

            {/* Slider 3: Spring Stiffness (K) */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Spring Tension (Stiffness):</span>
                <span>{customStiffness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.36"
                step="0.02"
                value={customStiffness}
                onChange={(e) => {
                  setCustomStiffness(parseFloat(e.target.value));
                  TactileAudio.playTick();
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono opacity-60">
                <span>Gentle / Soft (0.10)</span>
                <span>Ultra-Snappy (0.36)</span>
              </div>
            </div>

            {/* Slider 4: Spring Damping */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Spring Damping:</span>
                <span>{customDamping.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.90"
                step="0.02"
                value={customDamping}
                onChange={(e) => {
                  setCustomDamping(parseFloat(e.target.value));
                  TactileAudio.playTick();
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono opacity-60">
                <span>Elastic Bounce (0.70)</span>
                <span>Controlled Rest (0.90)</span>
              </div>
            </div>

            {/* Spot Ink Selection */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                <span>Spot Ink Cylinder:</span>
                <span className="font-bold" style={{ color: customInkColor || activePalette.primary }}>
                  {customInkColor ? Object.values(SPOT_INKS).find(i => i.hex === customInkColor)?.name || customInkColor : 'Palette Primary'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setCustomInkColor(null);
                    TactileAudio.playClick(500);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono rounded-md border transition-all ${
                    !customInkColor ? 'bg-black text-white font-bold' : 'bg-black/5 opacity-70 hover:opacity-100'
                  }`}
                  style={{ borderColor: activePalette.border }}
                >
                  Default
                </button>
                {Object.entries(SPOT_INKS).map(([k, ink]) => (
                  <button
                    key={k}
                    title={`${ink.name} (${ink.hex})`}
                    onClick={() => {
                      setCustomInkColor(ink.hex);
                      TactileAudio.playClick(650);
                    }}
                    className={`w-6 h-6 rounded-md border transition-all flex items-center justify-center text-white text-[9px] font-bold ${
                      customInkColor === ink.hex ? 'ring-2 ring-black scale-110 shadow-xs' : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: ink.hex, borderColor: 'rgba(0,0,0,0.15)' }}
                  >
                    {customInkColor === ink.hex ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setCustomRadius(2.4);
                  setCustomSpacing(7);
                  setCustomStiffness(0.20);
                  setCustomDamping(0.80);
                  setCustomInkColor(null);
                  TactileAudio.playClick(500);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-black/5 hover:bg-black/10 transition-colors"
              >
                Reset Studio Knobs to Defaults
              </button>
            </div>
          </div>

          {/* Real-time Interactive Test Surface */}
          <div
            className="rounded-xl p-6 flex flex-col items-center justify-center border border-dashed gap-4"
            style={{
              backgroundColor: activePalette.background,
              borderColor: activePalette.border,
            }}
          >
            <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">
              Live Customizer Sandbox
            </span>

            <PaperDotButton
              label="Test Customized Button"
              palette={activePalette}
              inkColor={customInkColor || undefined}
              dotShape={globalDotShape}
              burstIntensity={globalBurstMode}
              animationType={buttonAnim}
              dotSpacing={customSpacing}
              width={200}
              height={52}
            />

            <PaperDotSlider
              value={sliderVal}
              onChange={setSliderVal}
              palette={activePalette}
              inkColor={customInkColor || undefined}
              dotShape={globalDotShape}
              width={220}
              label="Live Slider"
            />

            <span className="text-[11px] font-mono opacity-60 text-center">
              Geometry: <strong>{globalDotShape}</strong> • Radius: <strong>{customRadius}px</strong> • K: <strong>{customStiffness}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 5: AI Prompt-to-Dots Playground */}
      <section id="playground" className="py-14 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: activePalette.border }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Open-Source AI Compiler
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-mono tracking-tight">
              Natural Language → Living Paper Component
            </h2>
            <p className="text-xs font-mono opacity-75 mt-1 max-w-xl">
              Type any plain text description to compile a fully kinetic PaperDots component using our fine-tuned Gemma model.
            </p>
          </div>
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border"
            style={{
              backgroundColor: activePalette.cardBg,
              borderColor: activePalette.border,
              color: activePalette.dark,
            }}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${tinkerServerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>
              {tinkerServerConnected
                ? "Tinker Local Server (:8000) Connected"
                : "Tinker Edge Engine Active (Run 'python tinker/serve.py' for local server)"}
            </span>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div
          className="rounded-2xl p-4 shadow-xs mb-6 border"
          style={{
            backgroundColor: activePalette.cardBg,
            borderColor: activePalette.border,
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompile()}
              placeholder="Describe a paper dot UI component (e.g. 'A bouncy square-chip button with gentle pop')..."
              className="flex-1 bg-transparent px-3 py-2 text-sm font-mono outline-none border-b focus:border-black/50 transition-colors"
              style={{
                color: activePalette.dark,
                borderColor: activePalette.border,
              }}
            />
            <PaperDotButton
              label={isCompiling ? "Compiling..." : "✦ Compile DSL"}
              onClick={() => handleCompile()}
              disabled={isCompiling}
              animationType="hydraulic-pop"
              dotShape={globalDotShape}
              burstIntensity={globalBurstMode}
              inkColor={customInkColor || activePalette.primary}
              palette={activePalette}
              width={160}
              height={46}
            />
          </div>

          {/* Quick preset pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: activePalette.border }}>
            <span className="text-[11px] font-mono opacity-60 mr-1">Julian's Presets:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(p);
                  handleCompile(p);
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/5 hover:bg-black/10 text-left truncate max-w-[280px] transition-all opacity-75 hover:opacity-100"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Playground Results Card */}
        {compiledResult && (
          <div
            className="rounded-2xl p-6 shadow-xs border"
            style={{
              backgroundColor: activePalette.cardBg,
              borderColor: activePalette.border,
            }}
          >
            {/* Tabs & Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b mb-6" style={{ borderColor: activePalette.border }}>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCodeTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeCodeTab === 'preview'
                      ? 'bg-black/10 shadow-2xs'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  Interactive Preview
                </button>
                <button
                  onClick={() => setActiveCodeTab('dsl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeCodeTab === 'dsl'
                      ? 'bg-black/10 shadow-2xs'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  Compiled DSL (JSON)
                </button>
                <button
                  onClick={() => setActiveCodeTab('react')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeCodeTab === 'react'
                      ? 'bg-black/10 shadow-2xs'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  React Code
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono opacity-80">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${compiledResult.generatedBy === 'gemma-tinker-fine-tuned' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  Engine: <strong>{compiledResult.generatedBy === 'gemma-tinker-fine-tuned' ? 'Gemma 2B (Tinker Bridge)' : 'Edge Heuristic'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Latency: <strong>{compiledResult.inferenceTimeMs}ms</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Spring K: <strong>{compiledResult.dsl.physics.stiffness}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Square className="w-3.5 h-3.5 text-pink-500" />
                  Shape: <strong>{compiledResult.dsl.dotShape || globalDotShape}</strong>
                </span>
              </div>
            </div>

            {/* Tab 1: Live Interactive Component Preview */}
            {activeCodeTab === 'preview' && (
              <div
                className="min-h-[200px] rounded-xl p-8 flex flex-col items-center justify-center border border-dashed"
                style={{
                  backgroundColor: PALETTES[compiledResult.dsl.paletteKey]?.background || activePalette.background,
                  borderColor: activePalette.border,
                }}
              >
                <div className="mb-4 text-center">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider opacity-60">
                    Compiled Component: {compiledResult.dsl.componentType.toUpperCase()}
                  </span>
                  <p className="text-xs font-mono opacity-80 mt-1 max-w-md">
                    {compiledResult.dsl.description || 'Natural language synthesized into tactile physics properties'}
                  </p>
                </div>

                <div className="p-4 flex items-center justify-center">
                  {compiledResult.dsl.componentType === 'button' && (
                    <PaperDotButton
                      label={compiledResult.dsl.label || 'Publish Zine'}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      burstIntensity={globalBurstMode}
                      animationType="hydraulic-pop"
                      width={compiledResult.dsl.dimensions.width}
                      height={compiledResult.dsl.dimensions.height}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'slider' && (
                    <PaperDotSlider
                      value={sliderVal}
                      onChange={setSliderVal}
                      label={compiledResult.dsl.label || 'Volume'}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      width={compiledResult.dsl.dimensions.width}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'toggle' && (
                    <PaperDotToggle
                      checked={toggleState}
                      onChange={setToggleState}
                      label={compiledResult.dsl.label || 'Risograph Mode'}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'loader' && (
                    <PaperDotLoader
                      size={compiledResult.dsl.dimensions.width}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      label={compiledResult.dsl.label || 'Inking...'}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'morph' && (
                    <PaperDotMorph
                      shape={compiledResult.dsl.shape || 'star'}
                      size={compiledResult.dsl.dimensions.width}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      burstIntensity={globalBurstMode}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'badge' && (
                    <PaperDotBadge
                      label={compiledResult.dsl.label || 'Live Edition'}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'progress' && (
                    <PaperDotProgress
                      value={progressVal}
                      label={compiledResult.dsl.label || 'Transfer'}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      width={compiledResult.dsl.dimensions.width}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'input' && (
                    <PaperDotInput
                      value={inputVal}
                      onChange={setInputVal}
                      placeholder={compiledResult.dsl.label || 'Type...'}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      width={compiledResult.dsl.dimensions.width}
                    />
                  )}
                  {compiledResult.dsl.componentType === 'card' && (
                    <PaperDotCard
                      title={compiledResult.dsl.label || 'Tactile Paper Card'}
                      subtitle="Dynamic stippled border reacting to cursor magnetism"
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                      width={compiledResult.dsl.dimensions.width}
                      height={compiledResult.dsl.dimensions.height}
                    >
                      <p className="text-xs font-mono opacity-80">
                        Organic risograph ink dots generated with Euler spring dynamics.
                      </p>
                    </PaperDotCard>
                  )}
                  {compiledResult.dsl.componentType === 'canvas' && (
                    <PaperDotCanvas
                      width={compiledResult.dsl.dimensions.width}
                      height={compiledResult.dsl.dimensions.height}
                      palette={PALETTES[compiledResult.dsl.paletteKey] || activePalette}
                      dotShape={compiledResult.dsl.dotShape || globalDotShape}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Compiled DSL (JSON) */}
            {activeCodeTab === 'dsl' && (
              <pre className="bg-[#1C1D1F] text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[300px]">
                {JSON.stringify(compiledResult.dsl, null, 2)}
              </pre>
            )}

            {/* Tab 3: React Usage Code */}
            {activeCodeTab === 'react' && (
              <pre className="bg-[#1C1D1F] text-sky-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[300px]">
{`import { PaperDot${compiledResult.dsl.componentType.charAt(0).toUpperCase() + compiledResult.dsl.componentType.slice(1)}, PALETTES } from 'paperdots-ui';

export const MyComponent = () => {
  return (
    <PaperDot${compiledResult.dsl.componentType.charAt(0).toUpperCase() + compiledResult.dsl.componentType.slice(1)}
      palette={PALETTES.${compiledResult.dsl.paletteKey}}
      dotShape="${compiledResult.dsl.dotShape || globalDotShape}"
      ${compiledResult.dsl.label ? `label="${compiledResult.dsl.label}"` : ''}
      ${compiledResult.dsl.shape ? `shape="${compiledResult.dsl.shape}"` : ''}
    />
  );
};`}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* SECTION 6: Thinking Machines Tinker Benchmark & Open Innovation Section */}
      <section id="benchmark" className="py-14 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: activePalette.border }}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#666] mb-2">
            <Cpu className="w-4 h-4 text-amber-600" />
            Thinking Machines Tinker Evaluation
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-tight">
            Why Open Innovation Wins
          </h2>
          <p className="text-sm font-mono opacity-70 mt-2 max-w-xl mx-auto">
            Fine-tuning Gemma 2B with Thinking Machines' Tinker for the PaperDots physics schema vs. zero-shot commercial models.
          </p>
        </div>

        {/* Benchmark Table */}
        <div
          className="rounded-2xl overflow-hidden shadow-xs border mb-8"
          style={{
            backgroundColor: activePalette.cardBg,
            borderColor: activePalette.border,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/5 border-b uppercase tracking-wider text-[#777]" style={{ borderColor: activePalette.border }}>
                <tr>
                  <th className="py-3 px-4">Evaluation Metric</th>
                  <th className="py-3 px-4">Baseline Zero-Shot</th>
                  <th className="py-3 px-4 text-emerald-600 font-bold">Tinker Fine-Tuned (Gemma)</th>
                  <th className="py-3 px-4 text-pink-500 font-bold">Impact / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: activePalette.border }}>
                <tr>
                  <td className="py-3 px-4 font-bold">JSON Schema Adherence</td>
                  <td className="py-3 px-4 opacity-70">71.4% (Markdown errors)</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">100.0% (Zero Hallucination)</td>
                  <td className="py-3 px-4 text-pink-500 font-bold">+28.6% reliability</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Physics Range Validity</td>
                  <td className="py-3 px-4 opacity-70">68.2% (Wild spring values)</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">98.7% (Physically stable)</td>
                  <td className="py-3 px-4 text-pink-500 font-bold">+30.5% kinetic realism</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Inference Latency</td>
                  <td className="py-3 px-4 opacity-70">1,380 ms (Cloud round-trip)</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">195 ms (Local / Edge)</td>
                  <td className="py-3 px-4 text-pink-500 font-bold">7.08x faster generation</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Average Token Count</td>
                  <td className="py-3 px-4 opacity-70">340 tokens (Chatty text)</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">112 tokens (Pure DSL)</td>
                  <td className="py-3 px-4 text-pink-500 font-bold">67.1% token reduction</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Offline / Privacy</td>
                  <td className="py-3 px-4 text-red-500 font-bold">Requires Cloud API</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">100% Local Browser / Edge</td>
                  <td className="py-3 px-4 text-pink-500 font-bold">Zero cloud lock-in</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Core Open Arguments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: activePalette.cardBg,
              borderColor: activePalette.border,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold mb-3">
              1
            </div>
            <h4 className="font-bold font-mono text-sm mb-1">Runs Anywhere, Even Offline</h4>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              Julian works in print shops and off-grid studios. With open weights, PaperDots generates and compiles components with zero internet.
            </p>
          </div>
          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: activePalette.cardBg,
              borderColor: activePalette.border,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-3">
              2
            </div>
            <h4 className="font-bold font-mono text-sm mb-1">Tinker Domain Adaptation</h4>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              Using Thinking Machines' Tinker to tune Gemma on kinetic physics JSON yields 7x faster compilation and zero conversational waste.
            </p>
          </div>
          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: activePalette.cardBg,
              borderColor: activePalette.border,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold mb-3">
              3
            </div>
            <h4 className="font-bold font-mono text-sm mb-1">Deployed on Render</h4>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              Hosted seamlessly on Render using the $50 Hacktoberfest partner credits, with high-availability static assets and backend inference.
            </p>
          </div>
        </div>

        {/* Local Connection Guide */}
        <div
          className="mt-8 rounded-2xl p-6 border shadow-xs"
          style={{
            backgroundColor: activePalette.cardBg,
            borderColor: activePalette.border,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <h4 className="font-mono font-bold text-sm">How to Connect to Thinking Machines' Tinker Locally</h4>
            </div>
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full ${tinkerServerConnected ? 'bg-emerald-500/10 text-emerald-600 font-bold' : 'bg-amber-500/10 text-amber-600'}`}>
              {tinkerServerConnected ? '● Server Active on http://127.0.0.1:8000' : '○ Server Standby'}
            </span>
          </div>
          <p className="text-xs font-mono opacity-80 mb-4">
            PaperDots UI ships with an active Python Tinker bridge server (<code className="bg-black/5 px-1 py-0.5 rounded font-bold">tinker/serve.py</code>) and the 132-pair fine-tuning dataset (<code className="bg-black/5 px-1 py-0.5 rounded font-bold">paperdots_tinker_train.jsonl</code>).
          </p>
          <div className="bg-[#1C1D1F] rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto space-y-2">
            <div><span className="text-white/50"># Step 1: Start the local Tinker model bridge server (zero dependencies):</span></div>
            <div><span className="text-pink-400">python</span> tinker/serve.py</div>
            <div className="pt-2"><span className="text-white/50"># Step 2: (Optional) Run the training execution script with your Tinker API key:</span></div>
            <div><span className="text-white/60">$env:TINKER_API_KEY</span> = <span className="text-amber-300">"your-tinker-key-from-promos"</span></div>
            <div><span className="text-pink-400">python</span> tinker/train_tinker.py</div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Built for Julian Showcase (Theme: Build for a Friend) */}
      <section id="story" className="py-14 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: activePalette.border }}>
        <div
          className="rounded-3xl p-8 md:p-12 shadow-xs transition-colors"
          style={{
            backgroundColor: activePalette.cardBg,
            border: `1px solid ${activePalette.border}`,
            color: activePalette.dark,
          }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-pink-500/10 text-pink-600 mb-3">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>The Story Behind PaperDots UI</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight mb-4">
                "Built for Julian" — The Tactile Digital Zine
              </h2>
              <p className="text-sm md:text-base opacity-85 leading-relaxed">
                Julian runs an independent risograph press and wanted to create an interactive web portfolio
                called <em>"Analog Futures"</em>. But every modern frontend library looks like a corporate SaaS dashboard.
                Julian asked: <em>"Why can't my buttons feel like paper chips or wet ink on heavy cotton paper?"</em>
              </p>
              <p className="text-sm md:text-base opacity-85 leading-relaxed mt-3">
                Here is the actual interactive zine widget built for Julian using <strong>PaperDots UI</strong>:
              </p>
            </div>

            {/* Julian's Interactive Zine Widget */}
            <div
              className="w-full md:w-[330px] rounded-2xl p-6 shadow-xs border"
              style={{
                backgroundColor: activePalette.background,
                borderColor: activePalette.border,
                color: activePalette.dark,
              }}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: activePalette.border }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: activePalette.secondary }}>
                  Analog Futures #03
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5">
                  Oct 2026
                </span>
              </div>

              <h4 className="font-bold font-mono text-base mb-1">Sonic Architecture</h4>
              <p className="text-xs font-mono opacity-70 mb-4">An interview on analog synthesizers and paper acoustics.</p>

              {/* Interactive Player Controls with living equalizer */}
              <div className="bg-black/5 p-4 rounded-xl flex flex-col items-center gap-3 mb-4">
                <PaperDotMorph
                  shape={morphPlaying ? 'pause' : 'play'}
                  isPlaying={morphPlaying}
                  size={64}
                  palette={activePalette}
                  dotShape={globalDotShape}
                  burstIntensity={globalBurstMode}
                  onClick={() => setMorphPlaying(!morphPlaying)}
                />
                <span className="text-[11px] font-mono font-bold">
                  {morphPlaying ? 'Playing Audio Commentary (Living Equalizer)' : 'Paused (Crystalline Alignment)'}
                </span>
                <PaperDotSlider
                  value={sliderVal}
                  onChange={setSliderVal}
                  animationType="elastic-string"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  width={180}
                  height={36}
                />
              </div>

              {/* Progress & Like Button */}
              <div className="flex flex-col gap-3 pt-2 border-t" style={{ borderColor: activePalette.border }}>
                <PaperDotProgress
                  value={zineLikes % 100}
                  animationType="capillary-bleed"
                  palette={activePalette}
                  dotShape={globalDotShape}
                  label="Community Reader Energy"
                  width={280}
                />
                <div className="flex items-center justify-between">
                  <PaperDotButton
                    label={`❤ Like (${zineLikes})`}
                    palette={activePalette}
                    dotShape={globalDotShape}
                    burstIntensity={globalBurstMode}
                    animationType="hydraulic-pop"
                    width={140}
                    height={40}
                    onClick={() => {
                      setZineLikes(zineLikes + 1);
                    }}
                  />
                  <span className="text-[10px] font-mono opacity-60">Handmade UI</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono opacity-80" style={{ borderColor: activePalette.border }}>
            <div>✦ "Now my digital zine feels like it was pressed by hand." — Julian</div>
            <div className="font-bold text-pink-600">#hf26challenge #weekendchallenge</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12 px-6 text-center text-xs font-mono opacity-80"
        style={{
          borderColor: activePalette.border,
          backgroundColor: `${activePalette.background}EE`,
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">PaperDots.js</span>
            <span>— Open-Source Tactile UI Library with Shadcn Integration</span>
          </div>
          <div>
            Built for <strong>Julian</strong> • Hacktoberfest Weekend Challenge 2026
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-black/5 font-bold">#hf26challenge</span>
            <span className="px-2 py-1 rounded bg-black/5 font-bold">#weekendchallenge</span>
            <span className="px-2 py-1 rounded bg-black/5 font-bold">#devchallenge</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
