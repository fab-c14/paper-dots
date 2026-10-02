import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotCanvasProps {
  width?: number;
  height?: number;
  spacing?: number;
  palette?: RisographPalette;
  interactiveRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

export const PaperDotCanvas: React.FC<PaperDotCanvasProps> = ({
  width = 800,
  height = 500,
  spacing = 24,
  palette = DEFAULT_PALETTE,
  interactiveRadius = 75,
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const pointerRef = useRef<PointerState>({
    x: -999,
    y: -999,
    prevX: -999,
    prevY: -999,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: interactiveRadius,
  });

  useEffect(() => {
    const dots: Dot[] = [];
    const cols = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);
    const startX = (width - cols * spacing) / 2 + spacing / 2;
    const startY = (height - rows * spacing) / 2 + spacing / 2;

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacing;
        const y = startY + r * spacing;

        const isAccent = (c * 7 + r * 13) % 11 === 0;
        const color = isAccent ? palette.secondary : palette.muted;
        const baseRad = isAccent ? 2.4 : 1.6;

        dots.push({
          id: id++,
          x,
          y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: baseRad,
          baseRadius: baseRad,
          color,
          opacity: isAccent ? 0.75 : 0.45,
          baseOpacity: isAccent ? 0.75 : 0.45,
          mass: 1.2,
          stiffness: 0.12,
          damping: 0.85,
          jitter: 0.08,
        });
      }
    }

    dotsRef.current = dots;
  }, [width, height, spacing, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);

      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: 0.12,
        damping: 0.85,
        mass: 1.2,
      });

      const paperPattern = PaperTextureGenerator.getPaperPattern(0.04);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.drawImage(paperPattern, 0, 0, width, height);
      ctx.restore();

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          dots[i].x,
          dots[i].y,
          dots[i].radius,
          dots[i].color,
          dots[i].opacity,
          false
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, palette]);

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
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ width, height, backgroundColor: palette.background }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { pointerRef.current.isInside = true; }}
      onPointerLeave={() => {
        pointerRef.current.isInside = false;
        pointerRef.current.x = -999;
        pointerRef.current.y = -999;
      }}
      onPointerDown={() => { pointerRef.current.isDown = true; }}
      onPointerUp={() => { pointerRef.current.isDown = false; }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};
