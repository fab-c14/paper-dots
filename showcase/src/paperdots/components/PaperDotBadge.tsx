import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotBadgeProps {
  label: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  variant?: 'primary' | 'secondary' | 'outline';
  dotPulse?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PaperDotBadge: React.FC<PaperDotBadgeProps> = ({
  label,
  palette = DEFAULT_PALETTE,
  dotShape = 'circle',
  variant = 'primary',
  dotPulse = true,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const width = 24;
  const height = 24;

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 15,
  });

  useEffect(() => {
    const color = variant === 'secondary' ? palette.secondary : palette.primary;
    dotRef.current = [
      {
        id: 'badge-dot',
        x: 12,
        y: 12,
        targetX: 12,
        targetY: 12,
        vx: 0,
        vy: 0,
        radius: 3.5,
        baseRadius: 3.5,
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
  }, [palette, variant, dotShape]);

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
      });

      const d = dotRef.current[0];
      if (d) {
        const pulse = dotPulse ? (Math.sin(time) + 1) * 0.5 : 0;
        const currentRad = d.radius + pulse * 1.0;
        PaperTextureGenerator.drawInkDot(ctx, d.x, d.y, currentRad, d.color, d.opacity, true, dotShape);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [dotPulse, dotShape]);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold select-none cursor-pointer transition-transform active:scale-95 ${className}`}
      style={{
        backgroundColor: palette.cardBg || palette.background,
        color: palette.dark,
        border: `1px solid ${palette.border || 'rgba(0,0,0,0.1)'}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => { pointerRef.current.isInside = true; }}
      onMouseLeave={() => { pointerRef.current.isInside = false; }}
    >
      <canvas ref={canvasRef} width={width} height={height} className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
};
