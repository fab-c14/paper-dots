import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, PresetShape, RisographPalette, DotGeometry, MorphAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { ShapeGenerator } from '../shapes';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotMorphProps {
  shape: PresetShape;
  size?: number;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  dotCount?: number;
  burstIntensity?: 'none' | 'gentle' | 'confetti';
  animationType?: MorphAnimationType;
  inkColor?: string;
  isPlaying?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PaperDotMorph: React.FC<PaperDotMorphProps> = ({
  shape,
  size = 120,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  dotCount = 90,
  burstIntensity = 'gentle',
  animationType = 'vortex-morph',
  inkColor,
  isPlaying = false,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const pulseProgressRef = useRef<number>(0);

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

  const center = size / 2;

  // Initialize dots with initial shape
  useEffect(() => {
    const points = ShapeGenerator.getShapePoints(shape, center, center, size * 0.42, dotCount);
    const dots: Dot[] = [];

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      dots.push({
        id: `morph-${i}`,
        x: pt.x + (Math.random() - 0.5) * 6,
        y: pt.y + (Math.random() - 0.5) * 6,
        targetX: pt.x,
        targetY: pt.y,
        vx: 0,
        vy: 0,
        radius: 2.6,
        baseRadius: 2.6,
        color: inkColor ? inkColor : (i % 3 === 0 ? palette.secondary : palette.primary),
        opacity: 0.9,
        baseOpacity: 0.9,
        mass: 0.8 + Math.random() * 0.4,
        stiffness: 0.20 + Math.random() * 0.05,
        damping: 0.78,
        jitter: 0.15,
        shape: dotShape,
      });
    }

    dotsRef.current = dots;
  }, [size, center, dotCount, palette, dotShape, inkColor, shape]);

  // Update target points when shape changes with distinct vortex swirl transition
  useEffect(() => {
    TactileAudio.playClick(720);
    const newPoints = ShapeGenerator.getShapePoints(shape, center, center, size * 0.42, dotCount);

    if (animationType === 'vortex-morph') {
      DotPhysicsEngine.triggerParticleVortex(dotsRef.current, center, center, 11);
    }
    DotPhysicsEngine.morphTargets(dotsRef.current, newPoints);
  }, [shape, center, size, dotCount, animationType]);

  // Animation Loop with Living Play/Pause and Shape Dynamics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      frameCountRef.current++;

      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, size, size);

      if (pulseProgressRef.current > 0) {
        pulseProgressRef.current = Math.max(0, pulseProgressRef.current - 0.04);
      }

      // Living Shape-Specific Animations:
      // 1. Play active: Living equalizer wave
      if (shape === 'play' || isPlaying) {
        DotPhysicsEngine.applySonicEqualizerWave(dotsRef.current, frameCountRef.current, 0.08, 4.5);
      }
      // 2. Pause active: Soft crystalline breathing pulse
      else if (shape === 'pause') {
        DotPhysicsEngine.applyHarmonicBreathing(dotsRef.current, frameCountRef.current, center, center, 0.04, 2.5);
      }
      // 3. Heart shape: Smooth wobble-free organic cardiac dilation
      else if (shape === 'heart') {
        DotPhysicsEngine.applySmoothPulse(dotsRef.current, frameCountRef.current, center, center, pulseProgressRef.current);
      }

      // Physics update with distinct hover dynamics
      DotPhysicsEngine.updateDots(
        dotsRef.current,
        pointerRef.current,
        {
          stiffness: 0.20,
          damping: 0.80,
          mass: 1.0,
        },
        1,
        shape === 'heart' ? 'smooth-pulse' : (animationType || 'particle-vortex')
      );

      // Render particles
      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          dots[i].x,
          dots[i].y,
          dots[i].radius,
          dots[i].color,
          dots[i].opacity,
          true,
          dots[i].shape || dotShape
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette, dotShape, shape, isPlaying, center]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const forceMult = burstIntensity === 'confetti' ? 1.4 : burstIntensity === 'none' ? 0 : 1.0;

    // Distinct On-Click Animations per Shape
    if (shape === 'play') {
      TactileAudio.playPop(580);
      if (forceMult > 0) DotPhysicsEngine.triggerRippleWave(dotsRef.current, clickX, clickY, 16, 11 * forceMult);
    } else if (shape === 'pause') {
      TactileAudio.playClick(420);
      if (forceMult > 0) DotPhysicsEngine.triggerLetterpressStamp(dotsRef.current, clickX, clickY, 8 * forceMult);
    } else if (shape === 'heart') {
      TactileAudio.playClick(460);
      pulseProgressRef.current = 1.0;
    } else if (shape === 'star') {
      TactileAudio.playPop(680);
      if (forceMult > 0) DotPhysicsEngine.triggerConfettiDrift(dotsRef.current, clickX, clickY, 15 * forceMult);
    } else {
      TactileAudio.playClick(600);
      if (forceMult > 0) DotPhysicsEngine.triggerParticleVortex(dotsRef.current, clickX, clickY, 12 * forceMult);
    }

    if (onClick) onClick();
  };

  return (
    <div className={`relative inline-block cursor-pointer select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-2xl shadow-xs transition-transform active:scale-95"
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => { pointerRef.current.isInside = true; }}
        onPointerLeave={() => { pointerRef.current.isInside = false; }}
      />
      <span
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase pointer-events-none whitespace-nowrap shadow-2xs border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.90)',
          color: palette.dark,
          borderColor: 'rgba(0, 0, 0, 0.12)',
        }}
      >
        {shape.toUpperCase()}
      </span>
    </div>
  );
};
