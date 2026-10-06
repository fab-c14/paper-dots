import React, { useEffect, useRef, useState } from 'react';
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
  size = 130,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  dotCount = 96,
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
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic hover toggle: hovering over 'play' morphs to 'pause', and vice-versa
  let activeShape = shape;
  if (isHovered) {
    if (shape === 'play') activeShape = 'pause';
    else if (shape === 'pause') activeShape = 'play';
  }

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 40,
  });

  const center = size / 2;

  // Initialize dots with initial shape (generous, crisp size)
  useEffect(() => {
    const points = ShapeGenerator.getShapePoints(shape, center, center, size * 0.44, dotCount);
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
        radius: 3.2,
        baseRadius: 3.2,
        color: inkColor ? inkColor : (i % 3 === 0 ? palette.secondary : palette.primary),
        opacity: 0.92,
        baseOpacity: 0.92,
        mass: 0.8 + Math.random() * 0.4,
        stiffness: 0.22 + Math.random() * 0.05,
        damping: 0.78,
        jitter: 0.12,
        shape: dotShape,
      });
    }

    dotsRef.current = dots;
  }, [size, center, dotCount, palette, dotShape, inkColor, shape]);

  // Update target points when active shape changes (including hover morph play <-> pause)
  useEffect(() => {
    TactileAudio.playClick(activeShape === 'pause' ? 520 : 720);
    const newPoints = ShapeGenerator.getShapePoints(activeShape, center, center, size * 0.44, dotCount);

    if (animationType === 'vortex-morph') {
      DotPhysicsEngine.triggerParticleVortex(dotsRef.current, center, center, 10);
    }
    DotPhysicsEngine.morphTargets(dotsRef.current, newPoints);
  }, [activeShape, center, size, dotCount, animationType]);

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

      if (pulseProgressRef.current > 0) {
        pulseProgressRef.current = Math.max(0, pulseProgressRef.current - 0.03);
      }

      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, size, size);

      // Living animation behavior per shape
      const dots = dotsRef.current;
      if (activeShape === 'play' || isPlaying) {
        // Living wave dynamics
        const wave = Math.sin(frameCountRef.current * 0.08) * 1.8;
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          d.y = d.targetY + Math.sin(frameCountRef.current * 0.06 + i * 0.2) * wave;
        }
      } else if (activeShape === 'heart') {
        const beat = (Math.sin(frameCountRef.current * 0.06) + 1) * 0.5;
        for (let i = 0; i < dots.length; i++) {
          dots[i].radius = dots[i].baseRadius + beat * 0.9 + pulseProgressRef.current * 1.5;
        }
      } else if (activeShape === 'star') {
        const twinkle = Math.sin(frameCountRef.current * 0.1) * 0.4;
        for (let i = 0; i < dots.length; i++) {
          if (i % 4 === 0) dots[i].radius = dots[i].baseRadius + twinkle;
        }
      }

      // Physics update with distinct hover reactions
      DotPhysicsEngine.updateDots(
        dotsRef.current,
        pointerRef.current,
        { stiffness: 0.22, damping: 0.78, mass: 1.0 },
        1,
        'glow-fade'
      );

      // Render dots
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        PaperTextureGenerator.drawInkDot(
          ctx,
          d.x,
          d.y,
          d.radius,
          d.color,
          d.opacity,
          true,
          d.shape || dotShape
        );
      }

      // Subtle paper grain overlay
      const paperPattern = PaperTextureGenerator.getPaperPattern(0.04);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(paperPattern, 0, 0, size, size);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette, dotShape, activeShape, isPlaying]);

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
    if (activeShape === 'play') {
      TactileAudio.playPop(580);
      if (forceMult > 0) DotPhysicsEngine.triggerRippleWave(dotsRef.current, clickX, clickY, 16, 11 * forceMult);
    } else if (activeShape === 'pause') {
      TactileAudio.playClick(420);
      if (forceMult > 0) DotPhysicsEngine.triggerLetterpressStamp(dotsRef.current, clickX, clickY, 8 * forceMult);
    } else if (activeShape === 'heart') {
      TactileAudio.playClick(460);
      pulseProgressRef.current = 1.0;
    } else if (activeShape === 'star') {
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
        onPointerEnter={() => {
          pointerRef.current.isInside = true;
          setIsHovered(true);
        }}
        onPointerLeave={() => {
          pointerRef.current.isInside = false;
          setIsHovered(false);
        }}
      />
    </div>
  );
};
