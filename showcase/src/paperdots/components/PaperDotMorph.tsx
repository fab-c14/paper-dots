import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, PresetShape, RisographPalette } from '../types';
import { DotPhysicsEngine } from '../physics';
import { ShapeGenerator } from '../shapes';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotMorphProps {
  shape: PresetShape;
  size?: number;
  palette?: RisographPalette;
  dotCount?: number;
  className?: string;
  onClick?: () => void;
}

export const PaperDotMorph: React.FC<PaperDotMorphProps> = ({
  shape,
  size = 120,
  palette = DEFAULT_PALETTE,
  dotCount = 90,
  className = '',
  onClick,
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
        x: pt.x + (Math.random() - 0.5) * 10,
        y: pt.y + (Math.random() - 0.5) * 10,
        targetX: pt.x,
        targetY: pt.y,
        vx: 0,
        vy: 0,
        radius: 2.6,
        baseRadius: 2.6,
        color: i % 3 === 0 ? palette.secondary : palette.primary,
        opacity: 0.9,
        baseOpacity: 0.9,
        mass: 0.8 + Math.random() * 0.4,
        stiffness: 0.14 + Math.random() * 0.05,
        damping: 0.78,
        jitter: 0.2,
      });
    }

    dotsRef.current = dots;
  }, [size, center, dotCount, palette]); // initial setup

  // Update target points when shape changes
  useEffect(() => {
    const newPoints = ShapeGenerator.getShapePoints(shape, center, center, size * 0.42, dotCount);
    DotPhysicsEngine.morphTargets(dotsRef.current, newPoints);
  }, [shape, center, size, dotCount]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, size, size);

      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: 0.16,
        damping: 0.8,
        mass: 1.0,
      });

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          dots[i].x,
          dots[i].y,
          dots[i].radius,
          dots[i].color,
          dots[i].opacity,
          true
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;
  };

  const handleClick = () => {
    DotPhysicsEngine.triggerScatter(
      dotsRef.current,
      pointerRef.current.x || center,
      pointerRef.current.y || center,
      18
    );
    if (onClick) onClick();
  };

  return (
    <div className={`relative inline-block cursor-pointer select-none ${className}`} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-2xl shadow-sm transition-transform active:scale-95"
        onPointerMove={handlePointerMove}
        onPointerEnter={() => { pointerRef.current.isInside = true; }}
        onPointerLeave={() => { pointerRef.current.isInside = false; }}
      />
    </div>
  );
};
