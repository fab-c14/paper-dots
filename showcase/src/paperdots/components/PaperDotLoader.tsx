import React, { useEffect, useRef } from 'react';
import type { RisographPalette, DotGeometry } from '../types';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotLoaderProps {
  size?: number;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  dotCount?: number;
  speed?: number;
  inkColor?: string;
  label?: string;
  className?: string;
}

export const PaperDotLoader: React.FC<PaperDotLoaderProps> = ({
  size = 100,
  palette = DEFAULT_PALETTE,
  dotShape = 'circle',
  dotCount = 16,
  speed = 1.0,
  inkColor,
  label = 'Inking...',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const center = size / 2;
  const radius = size * 0.32;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;

      time += 0.03 * speed;
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < dotCount; i++) {
        const theta = (i / dotCount) * Math.PI * 2 + time;
        const wave = Math.sin(time * 2 + i * 0.5);
        const curRadius = radius + wave * 4;

        const x = center + Math.cos(theta) * curRadius;
        const y = center + Math.sin(theta) * curRadius;

        const dotSize = 2.4 + (Math.sin(theta - time) + 1) * 1.5;
        const color = inkColor ? inkColor : (i % 2 === 0 ? palette.primary : palette.secondary);
        const opacity = 0.45 + (Math.sin(theta - time) + 1) * 0.3;

        PaperTextureGenerator.drawInkDot(ctx, x, y, dotSize, color, opacity, true, dotShape);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette, dotCount, speed, center, radius, dotShape, inkColor]);

  return (
    <div className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-inner"
      />
      {label && (
        <span
          className="text-xs font-mono font-bold tracking-widest uppercase animate-pulse"
          style={{ color: palette.dark }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
