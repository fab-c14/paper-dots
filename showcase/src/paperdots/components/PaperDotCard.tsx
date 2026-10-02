import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { ShapeGenerator } from '../shapes';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  width?: number;
  height?: number;
  className?: string;
}

export const PaperDotCard: React.FC<PaperDotCardProps> = ({
  title,
  subtitle,
  children,
  palette = DEFAULT_PALETTE,
  dotShape = 'circle',
  width = 300,
  height = 180,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);

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

  useEffect(() => {
    // Generate perimeter dots for rounded rectangle card border
    const borderPoints = ShapeGenerator.generateRoundedRect(8, 8, width - 16, height - 16, 14, 9);
    const dots: Dot[] = [];

    for (let i = 0; i < borderPoints.length; i++) {
      const pt = borderPoints[i];
      dots.push({
        id: `card-${i}`,
        x: pt.x,
        y: pt.y,
        targetX: pt.x,
        targetY: pt.y,
        vx: 0,
        vy: 0,
        radius: 2.2,
        baseRadius: 2.2,
        color: i % 4 === 0 ? palette.secondary : palette.primary,
        opacity: 0.85,
        baseOpacity: 0.85,
        mass: 1.0,
        stiffness: 0.20,
        damping: 0.80,
        jitter: 0.1,
        shape: dotShape,
      });
    }

    dotsRef.current = dots;
  }, [width, height, palette, dotShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const bgColor = palette.cardBg || palette.background;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: 0.20,
        damping: 0.80,
        mass: 1.0,
      });

      // Draw paper pattern
      const paperPattern = PaperTextureGenerator.getPaperPattern(0.04);
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.drawImage(paperPattern, 0, 0, width, height);
      ctx.restore();

      // Draw border dots
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
  }, [width, height, palette, dotShape]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow select-none ${className}`}
      style={{
        width,
        height,
        backgroundColor: palette.cardBg || palette.background,
        border: `1px solid ${palette.border || 'rgba(0,0,0,0.1)'}`,
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { pointerRef.current.isInside = true; }}
      onPointerLeave={() => { pointerRef.current.isInside = false; }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10 p-5 flex flex-col justify-between h-full pointer-events-auto">
        <div>
          {title && (
            <h3
              className="text-base font-bold font-mono tracking-tight"
              style={{ color: palette.dark }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className="text-xs font-mono mt-1 opacity-70"
              style={{ color: palette.dark }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
