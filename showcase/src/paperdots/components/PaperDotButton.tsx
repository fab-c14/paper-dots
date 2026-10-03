import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, ButtonAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotButtonProps {
  label: string;
  onClick?: () => void;
  palette?: RisographPalette;
  variant?: 'solid' | 'outline' | 'halftone';
  dotShape?: DotGeometry;
  burstIntensity?: 'none' | 'gentle' | 'confetti';
  animationType?: ButtonAnimationType;
  inkColor?: string;
  width?: number;
  height?: number;
  dotSpacing?: number;
  disabled?: boolean;
  className?: string;
}

export const PaperDotButton: React.FC<PaperDotButtonProps> = ({
  label,
  onClick,
  palette = DEFAULT_PALETTE,
  variant = 'solid',
  dotShape = 'square',
  burstIntensity = 'gentle',
  animationType = 'hydraulic-pop',
  inkColor,
  width = 160,
  height = 52,
  dotSpacing = 7,
  disabled = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  const activePrimary = inkColor || palette.primary;

  // Initialize dot lattice
  useEffect(() => {
    const dots: Dot[] = [];
    const cols = Math.floor((width - 16) / dotSpacing);
    const rows = Math.floor((height - 16) / dotSpacing);
    const startX = (width - cols * dotSpacing) / 2 + dotSpacing / 2;
    const startY = (height - rows * dotSpacing) / 2 + dotSpacing / 2;

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * dotSpacing;
        const y = startY + r * dotSpacing;

        // Skip corners for rounded look
        const cornerR = 12;
        const distTL = Math.hypot(x - cornerR, y - cornerR);
        const distTR = Math.hypot(x - (width - cornerR), y - cornerR);
        const distBL = Math.hypot(x - cornerR, y - (height - cornerR));
        const distBR = Math.hypot(x - (width - cornerR), y - (height - cornerR));

        const inCorner =
          (x < cornerR && y < cornerR && distTL > cornerR) ||
          (x > width - cornerR && y < cornerR && distTR > cornerR) ||
          (x < cornerR && y > height - cornerR && distBL > cornerR) ||
          (x > width - cornerR && y > height - cornerR && distBR > cornerR);

        if (inCorner) continue;

        const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (variant === 'outline' && !isBorder) continue;

        const baseRad = isBorder ? 2.4 : variant === 'halftone' ? (r % 2 === 0 ? 1.8 : 2.5) : 2.1;
        const dotColor = isBorder ? activePrimary : (c + r) % 3 === 0 ? palette.secondary : activePrimary;

        dots.push({
          id: id++,
          x: x + (Math.random() - 0.5) * 1.0,
          y: y + (Math.random() - 0.5) * 1.0,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: baseRad,
          baseRadius: baseRad,
          color: dotColor,
          opacity: 0.9,
          baseOpacity: 0.9,
          mass: 1.0,
          stiffness: 0.20,
          damping: 0.80,
          jitter: 0.15,
          shape: dotShape,
        });
      }
    }

    dotsRef.current = dots;
  }, [width, height, dotSpacing, palette, variant, dotShape, activePrimary]);

  const frameCountRef = useRef<number>(0);
  const pulseProgressRef = useRef<number>(0);
  const surgeRef = useRef<number>(0);

  // Canvas animation loop
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
        pulseProgressRef.current = Math.max(0, pulseProgressRef.current - 0.04);
      }
      if (surgeRef.current > 0) {
        surgeRef.current = Math.max(0, surgeRef.current - 0.04);
      }

      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);

      // Living animation dynamic behaviors
      if (animationType === 'snake-trail') {
        DotPhysicsEngine.applySnakeTrail(dotsRef.current, frameCountRef.current, width, height, surgeRef.current);
      } else if (animationType === 'border-wrap') {
        DotPhysicsEngine.applyBorderWrap(dotsRef.current, frameCountRef.current, width, height, surgeRef.current);
      } else if (animationType === 'glow-fade') {
        DotPhysicsEngine.applyGlowFade(dotsRef.current, frameCountRef.current, pulseProgressRef.current);
      } else if (animationType === 'smooth-pulse') {
        DotPhysicsEngine.applySmoothPulse(dotsRef.current, frameCountRef.current, width / 2, height / 2, pulseProgressRef.current);
      } else if (animationType === 'wave-sweep') {
        DotPhysicsEngine.applyWaveSweep(dotsRef.current, frameCountRef.current, width, surgeRef.current);
      }

      // Update physics
      DotPhysicsEngine.updateDots(
        dotsRef.current,
        pointerRef.current,
        { stiffness: 0.20, damping: 0.80, mass: 1.0 }
      );

      // Render dots or squares
      const dots = dotsRef.current;
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

      // Draw subtle paper fiber overlay
      const paperPattern = PaperTextureGenerator.getPaperPattern(0.04);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(paperPattern, 0, 0, width, height);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, palette, dotShape, animationType]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = x;
    pointerRef.current.y = y;
    pointerRef.current.isInside = true;
  };

  const handlePointerEnter = () => {
    pointerRef.current.isInside = true;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
    pointerRef.current.isDown = false;
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 1. Smooth living animations: zero scattering, elegant continuous tactile reactions
    if (animationType === 'snake-trail') {
      surgeRef.current = 1.0;
      TactileAudio.playRustle();
    } else if (animationType === 'border-wrap') {
      surgeRef.current = 1.0;
      TactileAudio.playTick();
    } else if (animationType === 'glow-fade') {
      pulseProgressRef.current = 1.0;
      TactileAudio.playClick(520);
    } else if (animationType === 'smooth-pulse') {
      pulseProgressRef.current = 1.0;
      TactileAudio.playClick(440);
    } else if (animationType === 'wave-sweep') {
      surgeRef.current = 1.0;
      TactileAudio.playRustle();
    } else {
      // 2. Tactile mechanical impulses
      const force = burstIntensity === 'confetti' ? 16 : burstIntensity === 'gentle' ? 10 : 0;
      if (burstIntensity !== 'none') {
        switch (animationType) {
          case 'hydraulic-pop':
            DotPhysicsEngine.triggerHydraulicPop(dotsRef.current, clickX, clickY, force);
            TactileAudio.playPop(520);
            break;
          case 'ripple-wave':
            DotPhysicsEngine.triggerRippleWave(dotsRef.current, clickX, clickY, 18, 12);
            TactileAudio.playRustle();
            break;
          case 'stamp-press':
            DotPhysicsEngine.triggerLetterpressStamp(dotsRef.current, clickX, clickY, 9);
            TactileAudio.playClick(440);
            break;
          case 'confetti-drift':
            DotPhysicsEngine.triggerConfettiDrift(dotsRef.current, clickX, clickY, force + 3);
            TactileAudio.playPop(620);
            break;
          case 'particle-vortex':
            DotPhysicsEngine.triggerParticleVortex(dotsRef.current, clickX, clickY, 13);
            TactileAudio.playClick(720);
            break;
          case 'micro-chatter':
            DotPhysicsEngine.triggerMicroChatter(dotsRef.current, 8);
            TactileAudio.playTick();
            break;
          default:
            DotPhysicsEngine.triggerHydraulicPop(dotsRef.current, clickX, clickY, force);
            TactileAudio.playPop(520);
        }
      } else {
        TactileAudio.playClick(600);
      }
    }

    if (onClick) onClick();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{
        width,
        height,
        filter: isHovered ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))',
        transform: pointerRef.current.isDown ? 'scale(0.97)' : isHovered ? 'translateY(-1px)' : 'none',
        transition: 'transform 0.15s ease, filter 0.15s ease',
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={() => { pointerRef.current.isDown = true; }}
      onPointerUp={() => { pointerRef.current.isDown = false; }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 rounded-xl"
        style={{ pointerEvents: 'none' }}
      />
      <span
        className="relative z-10 font-bold tracking-wider uppercase text-sm pointer-events-none"
        style={{
          color: palette.dark,
          fontFamily: '"Courier New", Courier, monospace',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        }}
      >
        {label}
      </span>
    </div>
  );
};
