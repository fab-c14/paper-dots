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
  size = 110,
  palette = DEFAULT_PALETTE,
  dotShape = 'circle',
  dotCount = 12,
  speed = 1.0,
  inkColor,
  label = 'Inking...',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const center = size / 2;
  const ringRadius = size * 0.34;
  const baseDotSize = Math.max(3.2, size * 0.036);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;

      time += 0.035 * speed;
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, size, size);

      // Subtle track circle guide
      ctx.beginPath();
      ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = palette.border || 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Head position moving around the circle [0 .. dotCount)
      const head = (time * speed * 2.6) % dotCount;

      for (let i = 0; i < dotCount; i++) {
        // Fixed static circular positions with equal spacing
        const angle = (i / dotCount) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * ringRadius;
        const y = center + Math.sin(angle) * ringRadius;

        // Circular distance behind the wave head
        let diff = (head - i) % dotCount;
        if (diff < 0) diff += dotCount;

        // Swell envelope: dot swells up, then resets back to base size
        let swell = 0;
        if (diff < 3.2) {
          swell = Math.pow(1 - diff / 3.2, 2.2);
        }

        const dotRadius = baseDotSize * (1 + swell * 1.5);
        const opacity = 0.32 + swell * 0.68;
        const color = swell > 0.25 ? (inkColor || palette.primary) : palette.muted;

        PaperTextureGenerator.drawInkDot(ctx, x, y, dotRadius, color, opacity, true, dotShape);
      }

      // Draw subtle paper fiber overlay
      const paperPattern = PaperTextureGenerator.getPaperPattern(0.03);
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(paperPattern, 0, 0, size, size);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette, dotCount, speed, center, ringRadius, baseDotSize, dotShape, inkColor]);

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-inner"
      />
      {label && (
        <span
          className="text-xs font-mono font-bold tracking-widest uppercase opacity-75"
          style={{ color: palette.dark }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
