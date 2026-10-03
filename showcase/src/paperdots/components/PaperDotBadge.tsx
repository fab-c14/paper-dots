import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, BadgeAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotBadgeProps {
  label: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  variant?: 'primary' | 'secondary' | 'outline';
  animationType?: BadgeAnimationType;
  dotPulse?: boolean;
  inkColor?: string;
  className?: string;
  onClick?: () => void;
}

export const PaperDotBadge: React.FC<PaperDotBadgeProps> = ({
  label,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  variant = 'primary',
  animationType = 'beacon-pulse',
  dotPulse = true,
  inkColor,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Increased size for tactile visibility and punch
  const width = 32;
  const height = 32;
  const center = 16;

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 20,
  });

  useEffect(() => {
    const color = inkColor || (variant === 'secondary' ? palette.secondary : palette.primary);
    dotRef.current = [
      {
        id: 'badge-dot',
        x: center,
        y: center,
        targetX: center,
        targetY: center,
        vx: 0,
        vy: 0,
        radius: 5.0,
        baseRadius: 5.0,
        color,
        opacity: 0.95,
        baseOpacity: 0.95,
        mass: 0.6,
        stiffness: 0.25,
        damping: 0.78,
        jitter: 0.1,
        shape: dotShape,
      },
    ];
  }, [palette, variant, dotShape, inkColor, center]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;

      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      DotPhysicsEngine.updateDots(dotRef.current, pointerRef.current, {
        stiffness: 0.25,
        damping: 0.78,
        mass: 0.6,
      }, 1, animationType);

      const d = dotRef.current[0];
      if (d) {
        let currentRad = d.radius;
        if (dotPulse && animationType === 'beacon-pulse') {
          const pulse = (Math.sin(time * 2) + 1) * 0.5;
          currentRad = d.baseRadius + pulse * 2.2;
        } else if (animationType === 'float-drift') {
          d.y = d.targetY + Math.sin(time) * 2.0;
        } else if (animationType === 'shimmer-wave') {
          d.opacity = 0.45 + Math.sin(time * 3) * 0.5;
        }

        PaperTextureGenerator.drawInkDot(ctx, d.x, d.y, currentRad, d.color, d.opacity, true, dotShape);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, dotShape, dotPulse, animationType]);

  const handleClick = () => {
    TactileAudio.playPop(620);
    DotPhysicsEngine.triggerHydraulicPop(dotRef.current, center, center, 12);
    if (onClick) onClick();
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold select-none cursor-pointer shadow-2xs hover:shadow-xs transition-shadow ${className}`}
      onClick={handleClick}
      style={{
        backgroundColor: palette.cardBg,
        border: `1px solid ${palette.border}`,
        color: palette.dark,
      }}
    >
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full pointer-events-none"
        />
      </div>
      <span className="tracking-wider uppercase text-xs font-extrabold">{label}</span>
    </div>
  );
};
