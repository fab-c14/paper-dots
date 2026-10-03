import React, { useEffect, useRef } from 'react';
import type { PaperDotComponentDSL } from '../ai/dsl';
import type { Dot, PointerState, RisographPalette, DotGeometry } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { PALETTES, DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';
import { PaperDotButton } from './PaperDotButton';
import { PaperDotSlider } from './PaperDotSlider';
import { PaperDotToggle } from './PaperDotToggle';
import { PaperDotTabs } from './PaperDotTabs';
import { PaperDotRating } from './PaperDotRating';
import { PaperDotDial } from './PaperDotDial';
import { PaperDotMorph } from './PaperDotMorph';
import { PaperDotBadge } from './PaperDotBadge';
import { PaperDotProgress } from './PaperDotProgress';
import { PaperDotInput } from './PaperDotInput';
import { PaperDotCard } from './PaperDotCard';
import { PaperDotCanvas } from './PaperDotCanvas';
import { PaperDotCheckbox } from './PaperDotCheckbox';
import { PaperDotRadio } from './PaperDotRadio';

export interface PaperDotUniversalProps {
  dsl: PaperDotComponentDSL;
  activePalette?: RisographPalette;
  globalDotShape?: DotGeometry;
  globalBurstMode?: 'none' | 'gentle' | 'confetti';
  className?: string;
}

export const PaperDotUniversal: React.FC<PaperDotUniversalProps> = ({
  dsl,
  activePalette = DEFAULT_PALETTE,
  globalDotShape = 'square',
  globalBurstMode = 'gentle',
  className = '',
}) => {
  const palette = PALETTES[dsl.paletteKey] || activePalette;
  const dotShape = dsl.dotShape || globalDotShape;
  const compType = dsl.componentType.toLowerCase();

  // Route to known standard component wrappers if matched
  if (compType === 'button') {
    return (
      <PaperDotButton
        label={dsl.label || 'Publish Zine'}
        palette={palette}
        dotShape={dotShape}
        burstIntensity={dsl.burstIntensity || globalBurstMode}
        animationType={dsl.animationType as any || 'hydraulic-pop'}
        inkColor={dsl.inkColor}
        hoverColor={dsl.hoverColor}
        width={dsl.dimensions?.width}
        height={dsl.dimensions?.height}
        className={className}
      />
    );
  }

  if (compType === 'slider') {
    return (
      <PaperDotSlider
        value={65}
        onChange={() => {}}
        label={dsl.label || 'Volume'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'elastic-string'}
        inkColor={dsl.inkColor}
        width={dsl.dimensions?.width}
        className={className}
      />
    );
  }

  if (compType === 'toggle') {
    return (
      <PaperDotToggle
        checked={true}
        onChange={() => {}}
        label={dsl.label || 'Risograph Mode'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'cylinder-roll'}
        inkColor={dsl.inkColor}
        className={className}
      />
    );
  }

  if (compType === 'checkbox') {
    return (
      <PaperDotCheckbox
        checked={true}
        onChange={() => {}}
        label={dsl.label || 'Publish Option'}
        palette={palette}
        dotShape={dotShape}
        inkColor={dsl.inkColor}
        className={className}
      />
    );
  }

  if (compType === 'radio') {
    return (
      <PaperDotRadio
        checked={true}
        onChange={() => {}}
        label={dsl.label || 'Selected Option'}
        palette={palette}
        dotShape={dotShape}
        inkColor={dsl.inkColor}
        className={className}
      />
    );
  }

  if (compType === 'tabs') {
    return (
      <PaperDotTabs
        items={['Overview', 'Zine Press', 'Halftones']}
        activeIndex={0}
        onChange={() => {}}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'crawl-slide'}
        inkColor={dsl.inkColor}
        width={dsl.dimensions?.width || 320}
        className={className}
      />
    );
  }

  if (compType === 'rating') {
    return (
      <PaperDotRating
        value={5}
        onChange={() => {}}
        shape={dsl.shape === 'heart' ? 'heart' : 'star'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'bloom-expand'}
        inkColor={dsl.inkColor}
        className={className}
      />
    );
  }

  if (compType === 'dial') {
    return (
      <PaperDotDial
        value={72}
        onChange={() => {}}
        label={dsl.label || 'Cutoff'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'radial-sweep'}
        inkColor={dsl.inkColor}
        size={dsl.dimensions?.width || 110}
        className={className}
      />
    );
  }

  if (compType === 'morph') {
    return (
      <PaperDotMorph
        shape={dsl.shape || 'star'}
        size={dsl.dimensions?.width || 110}
        palette={palette}
        dotShape={dotShape}
        burstIntensity={dsl.burstIntensity || globalBurstMode}
        animationType={(dsl.animationType as any) || (dsl.shape === 'heart' ? 'smooth-pulse' : 'vortex-morph')}
        inkColor={dsl.inkColor}
        className={className}
      />
    );
  }

  if (compType === 'badge') {
    return (
      <PaperDotBadge
        label={dsl.label || 'Live Edition'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'beacon-pulse'}
        inkColor={dsl.inkColor}
        className={className}
      />
    );
  }

  if (compType === 'progress') {
    return (
      <PaperDotProgress
        value={68}
        label={dsl.label || 'Transfer'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'domino-cascade'}
        inkColor={dsl.inkColor}
        width={dsl.dimensions?.width}
        className={className}
      />
    );
  }

  if (compType === 'input') {
    return (
      <PaperDotInput
        value="Search Zines..."
        onChange={() => {}}
        placeholder={dsl.label || 'Type...'}
        palette={palette}
        dotShape={dotShape}
        animationType={dsl.animationType as any || 'typewriter-recoil'}
        inkColor={dsl.inkColor}
        width={dsl.dimensions?.width}
        className={className}
      />
    );
  }

  if (compType === 'card') {
    return (
      <PaperDotCard
        title={dsl.label || 'Tactile Paper Card'}
        subtitle="Dynamic stippled border reacting to cursor magnetism"
        palette={palette}
        dotShape={dotShape}
        width={dsl.dimensions?.width}
        height={dsl.dimensions?.height}
        className={className}
      >
        <p className="text-xs font-mono opacity-80">
          Organic risograph ink dots generated with Euler spring dynamics.
        </p>
      </PaperDotCard>
    );
  }

  if (compType === 'canvas') {
    return (
      <PaperDotCanvas
        width={dsl.dimensions?.width || 440}
        height={dsl.dimensions?.height || 220}
        palette={palette}
        dotShape={dotShape}
        className={className}
      />
    );
  }

  // =========================================================================
  // UNIVERSAL GENERATIVE KINETIC ENGINE (FOR COMPLETELY NOVEL/UNKNOWN TYPES)
  // Synthesizes an interactive living paper-dot formation from the DSL!
  // =========================================================================
  return <GenerativePaperDotCanvas dsl={dsl} palette={palette} dotShape={dotShape} className={className} />;
};

/**
 * Universal Generative Canvas for Novel & Custom AI-Generated Components
 * Synthesizes living dot formations: Equalizer, Radar, Galaxy, Waveform, Matrix, Pendulum, Keypad, Heartbeat, and Custom Kinetic Fields.
 */
const GenerativePaperDotCanvas: React.FC<{
  dsl: PaperDotComponentDSL;
  palette: RisographPalette;
  dotShape: DotGeometry;
  className?: string;
}> = ({ dsl, palette, dotShape, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  const width = dsl.dimensions?.width || 280;
  const height = dsl.dimensions?.height || 140;
  const activePrimary = dsl.inkColor || palette.primary;
  const animationType = (dsl.animationType || 'wave-sweep').toLowerCase();
  const compType = (dsl.componentType || 'generative').toLowerCase();

  const isRadar = compType.includes('radar') || compType.includes('sonar') || compType.includes('scan') || animationType.includes('radar');
  const isSpiral = compType.includes('galaxy') || compType.includes('spiral') || compType.includes('vortex') || compType.includes('cyclone') || animationType.includes('vortex') || animationType.includes('swirl') || animationType.includes('spiral');
  const isEqualizer = compType.includes('equalizer') || compType.includes('audio') || compType.includes('spectrum') || compType.includes('freq') || animationType.includes('equalizer') || animationType.includes('frequency') || animationType.includes('bars');
  const isWaveform = compType.includes('wave') || compType.includes('sine') || compType.includes('oscillo') || animationType.includes('sine') || animationType.includes('waveform');
  const isMatrix = compType.includes('matrix') || compType.includes('glitch') || compType.includes('rain') || compType.includes('data') || animationType.includes('matrix');
  const isPendulum = compType.includes('pendulum') || compType.includes('metronome') || animationType.includes('pendulum') || animationType.includes('swing');
  const isKeypad = compType.includes('keypad') || compType.includes('numpad') || compType.includes('pin');
  const isHeartbeat = compType.includes('heart') || compType.includes('ecg') || compType.includes('pulse');

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 35,
  });

  // Synthesize generative dot lattice based on prompt structure
  useEffect(() => {
    const dots: Dot[] = [];
    const center = { x: width / 2, y: height / 2 };

    if (isSpiral) {
      // 1. Archimedean Galaxy Spiral Formation
      const totalDots = 72;
      const maxR = Math.min(width, height) * 0.42;
      for (let i = 0; i < totalDots; i++) {
        const theta = i * 0.38;
        const r = (i / totalDots) * maxR;
        const x = center.x + Math.cos(theta) * r;
        const y = center.y + Math.sin(theta) * r;
        dots.push({
          id: `gen-spiral-${i}`,
          x,
          y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: 2.2,
          baseRadius: 2.2,
          color: i % 2 === 0 ? activePrimary : (palette.secondary || '#FF48B0'),
          opacity: 0.85,
          baseOpacity: 0.85,
          mass: 0.9,
          stiffness: dsl.physics?.stiffness || 0.24,
          damping: dsl.physics?.damping || 0.78,
          jitter: dsl.physics?.jitter || 0.1,
          shape: dotShape,
          phaseOffset: i * 0.1,
        });
      }
    } else if (isRadar) {
      // 2. Concentric Radar Rings & Crosshairs Formation
      const rings = [0.35, 0.65, 0.95];
      const maxR = Math.min(width, height) * 0.42;
      rings.forEach((rf, ringIdx) => {
        const count = 12 + ringIdx * 8;
        const rad = maxR * rf;
        for (let i = 0; i < count; i++) {
          const theta = (i / count) * Math.PI * 2;
          const x = center.x + Math.cos(theta) * rad;
          const y = center.y + Math.sin(theta) * rad;
          dots.push({
            id: `gen-radar-ring-${ringIdx}-${i}`,
            x,
            y,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            radius: 2.0,
            baseRadius: 2.0,
            color: activePrimary,
            opacity: 0.4,
            baseOpacity: 0.4,
            mass: 1.0,
            stiffness: 0.22,
            damping: 0.80,
            jitter: 0.05,
            shape: dotShape,
            phaseOffset: theta,
          });
        }
      });
      // Crosshair dots
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        dots.push({
          id: `gen-radar-ch-x-${i}`,
          x: center.x + i * 14,
          y: center.y,
          targetX: center.x + i * 14,
          targetY: center.y,
          vx: 0,
          vy: 0,
          radius: 1.8,
          baseRadius: 1.8,
          color: palette.secondary || '#FF48B0',
          opacity: 0.5,
          baseOpacity: 0.5,
          mass: 1.0,
          stiffness: 0.25,
          damping: 0.8,
          jitter: 0.05,
          shape: dotShape,
          phaseOffset: Math.PI / 2,
        });
      }
    } else if (isEqualizer) {
      // 3. Multi-column Vertical Equalizer Spectrum
      const cols = 12;
      const rows = 8;
      const colW = (width - 32) / cols;
      const rowH = (height - 36) / rows;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = 16 + c * colW + colW / 2;
          const y = height - 16 - r * rowH;
          dots.push({
            id: `gen-eq-${c}-${r}`,
            x,
            y,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            radius: 2.2,
            baseRadius: 2.2,
            color: r > 5 ? (palette.secondary || '#FF48B0') : activePrimary,
            opacity: 0.7,
            baseOpacity: 0.7,
            mass: 1.0,
            stiffness: 0.25,
            damping: 0.8,
            jitter: 0.08,
            shape: dotShape,
            phaseOffset: c * 0.4 + r * 0.2,
          });
        }
      }
    } else if (isWaveform) {
      // 4. Horizontal Continuous Waveform Ribbon
      const count = 36;
      const step = (width - 32) / (count - 1);
      for (let i = 0; i < count; i++) {
        const x = 16 + i * step;
        const y = center.y;
        dots.push({
          id: `gen-wave-${i}`,
          x,
          y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: 2.4,
          baseRadius: 2.4,
          color: i % 4 === 0 ? (palette.secondary || '#FF48B0') : activePrimary,
          opacity: 0.85,
          baseOpacity: 0.85,
          mass: 0.9,
          stiffness: 0.28,
          damping: 0.75,
          jitter: 0.05,
          shape: dotShape,
          phaseOffset: (i / count) * Math.PI * 4,
        });
      }
    } else if (isMatrix) {
      // 5. Digital Rain Matrix Columns
      const cols = 14;
      const rows = 7;
      const colW = (width - 32) / cols;
      const rowH = (height - 32) / rows;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = 16 + c * colW + colW / 2;
          const y = 16 + r * rowH;
          dots.push({
            id: `gen-matrix-${c}-${r}`,
            x,
            y,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            radius: 1.9,
            baseRadius: 1.9,
            color: activePrimary,
            opacity: 0.6,
            baseOpacity: 0.6,
            mass: 1.0,
            stiffness: 0.22,
            damping: 0.82,
            jitter: 0.12,
            shape: dotShape,
            phaseOffset: c * 0.5 + r * 0.3,
          });
        }
      }
    } else if (isPendulum) {
      // 6. Suspended Pendulum Lattice
      const stringDots = 8;
      for (let i = 0; i < stringDots; i++) {
        const y = 20 + i * ((height - 50) / stringDots);
        dots.push({
          id: `gen-pendulum-str-${i}`,
          x: center.x,
          y,
          targetX: center.x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: 1.8,
          baseRadius: 1.8,
          color: activePrimary,
          opacity: 0.6,
          baseOpacity: 0.6,
          mass: 0.8,
          stiffness: 0.3,
          damping: 0.75,
          jitter: 0.05,
          shape: dotShape,
          phaseOffset: i * 0.1,
        });
      }
      // Pendulum Bob
      const bobDots = 8;
      for (let i = 0; i < bobDots; i++) {
        const theta = (i / bobDots) * Math.PI * 2;
        const bx = center.x + Math.cos(theta) * 12;
        const by = height - 26 + Math.sin(theta) * 12;
        dots.push({
          id: `gen-pendulum-bob-${i}`,
          x: bx,
          y: by,
          targetX: bx,
          targetY: by,
          vx: 0,
          vy: 0,
          radius: 2.6,
          baseRadius: 2.6,
          color: palette.secondary || '#FF48B0',
          opacity: 0.9,
          baseOpacity: 0.9,
          mass: 1.2,
          stiffness: 0.22,
          damping: 0.8,
          jitter: 0.05,
          shape: dotShape,
          phaseOffset: theta,
        });
      }
    } else if (isHeartbeat) {
      // 7. ECG / Heartbeat Monitor Ribbon
      const count = 38;
      const step = (width - 32) / (count - 1);
      for (let i = 0; i < count; i++) {
        const x = 16 + i * step;
        const y = center.y;
        dots.push({
          id: `gen-ecg-${i}`,
          x,
          y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: 2.2,
          baseRadius: 2.2,
          color: activePrimary,
          opacity: 0.5,
          baseOpacity: 0.5,
          mass: 1.0,
          stiffness: 0.26,
          damping: 0.78,
          jitter: 0.05,
          shape: dotShape,
          phaseOffset: i / count,
        });
      }
    } else if (isKeypad) {
      // 8. 3x4 Tactile Keypad Matrix
      const padCols = 3;
      const padRows = 4;
      const padW = (width - 40) / padCols;
      const padH = (height - 40) / padRows;
      for (let r = 0; r < padRows; r++) {
        for (let c = 0; c < padCols; c++) {
          const kx = 20 + c * padW + padW / 2;
          const ky = 20 + r * padH + padH / 2;
          // Cluster of 4 dots per key
          const offsets = [
            { dx: -5, dy: -5 },
            { dx: 5, dy: -5 },
            { dx: -5, dy: 5 },
            { dx: 5, dy: 5 },
          ];
          offsets.forEach((off, idx) => {
            dots.push({
              id: `gen-keypad-${r}-${c}-${idx}`,
              x: kx + off.dx,
              y: ky + off.dy,
              targetX: kx + off.dx,
              targetY: ky + off.dy,
              vx: 0,
              vy: 0,
              radius: 2.2,
              baseRadius: 2.2,
              color: activePrimary,
              opacity: 0.85,
              baseOpacity: 0.85,
              mass: 1.0,
              stiffness: 0.24,
              damping: 0.8,
              jitter: 0.05,
              shape: dotShape,
              phaseOffset: r * 0.3 + c * 0.2,
            });
          });
        }
      }
    } else {
      // 9. Organic Stippled Perimeter & Field Lattice
      const cols = Math.floor((width - 24) / 10);
      const rows = Math.floor((height - 24) / 10);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
          const isDiagonal = (r + c) % 3 === 0;
          if (isEdge || isDiagonal) {
            const x = 12 + c * 10 + 5;
            const y = 12 + r * 10 + 5;
            dots.push({
              id: `gen-field-${r}-${c}`,
              x,
              y,
              targetX: x,
              targetY: y,
              vx: 0,
              vy: 0,
              radius: isEdge ? 2.4 : 1.8,
              baseRadius: isEdge ? 2.4 : 1.8,
              color: isEdge ? activePrimary : (palette.secondary || '#FF48B0'),
              opacity: isEdge ? 0.9 : 0.4,
              baseOpacity: isEdge ? 0.9 : 0.4,
              mass: 1.0,
              stiffness: dsl.physics?.stiffness || 0.24,
              damping: dsl.physics?.damping || 0.78,
              jitter: dsl.physics?.jitter || 0.1,
              shape: dotShape,
              phaseOffset: c * 0.2 + r * 0.2,
            });
          }
        }
      }
    }

    dotsRef.current = dots;
  }, [width, height, animationType, compType, activePrimary, palette, dotShape, dsl.physics, isSpiral, isRadar, isEqualizer, isWaveform, isMatrix, isPendulum, isHeartbeat, isKeypad]);

  // Living Kinetic Animation Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      frameCountRef.current++;
      const time = frameCountRef.current * 0.04;
      const center = { x: width / 2, y: height / 2 };

      ctx.clearRect(0, 0, width, height);

      // Paper background container
      ctx.fillStyle = palette.cardBg || '#F5F2EB';
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 12);
      ctx.fill();

      ctx.strokeStyle = palette.border || '#D8D4C7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dynamic Living Animation Routine
      dotsRef.current.forEach((dot) => {
        if (isSpiral) {
          // Celestial Galaxy Vortex rotation
          const dx = dot.targetX - center.x;
          const dy = dot.targetY - center.y;
          const r = Math.hypot(dx, dy);
          const theta = Math.atan2(dy, dx) + 0.02 * (50 / (r + 15));
          dot.targetX = center.x + Math.cos(theta) * r;
          dot.targetY = center.y + Math.sin(theta) * r;
        } else if (isRadar) {
          // Sweeping 360-degree radar beam with phosphor persistence
          const sweepAngle = (time * 2.2) % (Math.PI * 2);
          const dotAngle = Math.atan2(dot.y - center.y, dot.x - center.x);
          let diff = (sweepAngle - dotAngle) % (Math.PI * 2);
          if (diff < 0) diff += Math.PI * 2;
          if (diff < 0.65) {
            const glow = 1 - diff / 0.65;
            dot.opacity = 0.35 + 0.65 * glow;
            dot.radius = dot.baseRadius * (1 + 0.5 * glow);
          } else {
            dot.opacity = 0.35;
            dot.radius = dot.baseRadius;
          }
        } else if (isEqualizer) {
          // Acoustic equalizer bars with rhythmic bouncing peaks
          const colIndexMatch = String(dot.id).match(/gen-eq-(\d+)-(\d+)/);
          if (colIndexMatch) {
            const col = parseInt(colIndexMatch[1], 10);
            const row = parseInt(colIndexMatch[2], 10);
            const colEnergy = Math.abs(Math.sin(time * 3 + col * 0.9) * 0.6 + Math.cos(time * 1.7 + col * 1.4) * 0.4);
            const activeLevel = Math.floor(colEnergy * 8);
            if (row <= activeLevel) {
              dot.opacity = 0.95;
              dot.radius = dot.baseRadius * 1.1;
            } else {
              dot.opacity = 0.2;
              dot.radius = dot.baseRadius * 0.85;
            }
          }
        } else if (isWaveform) {
          // Sinusoidal acoustic ribbon wave
          dot.targetY = center.y + Math.sin((dot.targetX / width) * Math.PI * 4 + time * 3) * (height * 0.28) + Math.cos((dot.targetX / width) * Math.PI * 8 - time * 2) * 6;
        } else if (isMatrix) {
          // Digital rain cascade
          dot.targetY = (dot.targetY + 1.8 + (dot.phaseOffset || 0) * 0.2);
          if (dot.targetY > height - 14) {
            dot.targetY = 16;
          }
        } else if (isPendulum) {
          // Harmonic swinging pendulum oscillation
          const swing = Math.sin(time * 2.2) * 0.65;
          const isBob = String(dot.id).includes('bob');
          if (isBob) {
            const baseTheta = dot.phaseOffset || 0;
            const bobCenterX = center.x + Math.sin(swing) * (height * 0.62);
            const bobCenterY = 20 + Math.cos(swing) * (height * 0.62);
            dot.targetX = bobCenterX + Math.cos(baseTheta) * 12;
            dot.targetY = bobCenterY + Math.sin(baseTheta) * 12;
          } else {
            const strIdx = parseInt(String(dot.id).split('-').pop() || '0', 10);
            const frac = (strIdx + 1) / 9;
            dot.targetX = center.x + Math.sin(swing) * (height * 0.62 * frac);
            dot.targetY = 20 + Math.cos(swing) * (height * 0.62 * frac);
          }
        } else if (isHeartbeat) {
          // Cardiac P-Q-R-S-T wave pulse
          const scanX = (frameCountRef.current * 4) % (width + 60) - 30;
          const dist = dot.targetX - scanX;
          if (Math.abs(dist) < 25) {
            const norm = dist / 25;
            const ecg = Math.exp(-norm * norm * 12) * -(height * 0.38) + Math.sin(norm * Math.PI * 2) * 8;
            dot.targetY = center.y + ecg;
            dot.opacity = 1.0;
          } else {
            dot.targetY = center.y;
            dot.opacity = 0.35;
          }
        } else if (animationType.includes('snake') || animationType.includes('trail')) {
          // Living snake crawling wave
          const wave = Math.sin(time * 2 + (dot.phaseOffset || 0)) * 3;
          dot.x = dot.targetX + Math.cos(time + (dot.phaseOffset || 0)) * wave;
          dot.y = dot.targetY + Math.sin(time + (dot.phaseOffset || 0)) * wave;
        } else if (animationType.includes('pulse') || animationType.includes('breathe') || animationType.includes('fade') || animationType.includes('glow')) {
          // Harmonic cardiac dilation & glowing fade
          const pulse = (Math.sin(time * 2.5 + (dot.phaseOffset || 0)) + 1) * 0.35;
          dot.radius = dot.baseRadius * (1 + pulse);
          dot.opacity = 0.5 + pulse * 0.5;
        } else if (animationType.includes('wave') || animationType.includes('sweep')) {
          // Laminar ink wave rolling across x
          const waveX = (frameCountRef.current * 3) % (width + 60) - 30;
          const dist = Math.abs(dot.targetX - waveX);
          if (dist < 40) {
            const factor = 1 - dist / 40;
            dot.radius = dot.baseRadius * (1 + factor * 0.8);
            dot.y = dot.targetY - factor * 4;
            dot.opacity = 1.0;
          } else {
            dot.radius = dot.baseRadius;
            dot.y = dot.targetY;
            dot.opacity = dot.baseOpacity;
          }
        } else {
          // Subtle organic paper drift
          dot.x = dot.targetX + Math.sin(time + (dot.phaseOffset || 0)) * 1.5;
          dot.y = dot.targetY + Math.cos(time * 0.8 + (dot.phaseOffset || 0)) * 1.5;
        }
      });

      // Apply Euler spring physics & mouse interaction with distinct hover dynamics
      DotPhysicsEngine.updateDots(
        dotsRef.current,
        pointerRef.current,
        {
          stiffness: dsl.physics?.stiffness || 0.24,
          damping: dsl.physics?.damping || 0.78,
          mass: 1.0,
        },
        1,
        animationType
      );

      // Render dots with hover dynamic behaviors (color shift, bloom, scale)
      const isHovered = pointerRef.current.isInside;
      dotsRef.current.forEach((dot) => {
        let drawColor = dot.color;
        let drawRadius = dot.radius;
        if (isHovered && dsl.hoverColor) {
          drawColor = dsl.hoverColor;
        }
        if (isHovered && (dsl.hoverBehavior === 'bloom' || dsl.hoverBehavior === 'scale')) {
          drawRadius = dot.radius * 1.35;
        }
        PaperTextureGenerator.drawInkDot(ctx, dot.x, dot.y, drawRadius, drawColor, dot.opacity, true, dot.shape);
      });

      // Keypad numerical overlay
      if (isKeypad) {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const padCols = 3;
        const padRows = 4;
        const padW = (width - 40) / padCols;
        const padH = (height - 40) / padRows;
        ctx.fillStyle = palette.dark;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let r = 0; r < padRows; r++) {
          for (let c = 0; c < padCols; c++) {
            const idx = r * padCols + c;
            const kx = 20 + c * padW + padW / 2;
            const ky = 20 + r * padH + padH / 2;
            ctx.fillText(keys[idx], kx, ky);
          }
        }
      }

      // Clean, elegant label at top left & animation tag at top right
      ctx.fillStyle = palette.dark;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText((dsl.label || dsl.componentType).toUpperCase(), 14, 20);

      ctx.fillStyle = (isHovered && dsl.hoverColor) ? dsl.hoverColor : activePrimary;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(dsl.animationType || 'kinetic-spring', width - 14, 20);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, animationType, compType, palette, activePrimary, dotShape, dsl, isSpiral, isRadar, isEqualizer, isWaveform, isMatrix, isPendulum, isHeartbeat]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Send impulse ripple or sound
    if (isRadar) {
      TactileAudio.playPop(780);
    } else if (isEqualizer) {
      TactileAudio.playRustle();
    } else {
      TactileAudio.playClick(640);
    }

    // Zero burst mode check (smooth / hearts / no burst)
    const noBurst = dsl.burstIntensity === 'none' || animationType.includes('smooth') || compType.includes('heart');
    if (!noBurst) {
      dotsRef.current.forEach((dot) => {
        const dx = dot.x - clickX;
        const dy = dot.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (1 - dist / 80) * 8;
          dot.vx += (dx / (dist || 1)) * force;
          dot.vy += (dy / (dist || 1)) * force;
        }
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
  };

  return (
    <div
      className={`relative inline-block select-none cursor-pointer overflow-hidden rounded-xl font-mono ${className}`}
      style={{ width, height }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
      />
    </div>
  );
};

