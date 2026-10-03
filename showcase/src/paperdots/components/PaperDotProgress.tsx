import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, ProgressAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotProgressProps {
  value: number; // 0 to 100
  segments?: number;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: ProgressAnimationType;
  inkColor?: string;
  width?: number;
  height?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export const PaperDotProgress: React.FC<PaperDotProgressProps> = ({
  value,
  segments = 16,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'domino-cascade',
  inkColor,
  width = 240,
  height = 36,
  label,
  showPercent = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 25,
  });

  const clampedVal = Math.max(0, Math.min(100, value));
  const activeSegments = Math.round((clampedVal / 100) * segments);
  const paddingX = 14;
  const availWidth = width - paddingX * 2;
  const spacing = availWidth / (segments - 1);
  const centerY = height / 2;

  useEffect(() => {
    const dots: Dot[] = [];
    for (let i = 0; i < segments; i++) {
      const x = paddingX + i * spacing;
      const isActive = i < activeSegments;
      const color = isActive ? (inkColor || palette.primary) : palette.muted;

      dots.push({
        id: `prog-${i}`,
        x,
        y: centerY,
        targetX: x,
        targetY: centerY,
        vx: 0,
        vy: 0,
        radius: isActive ? 3.0 : 2.0,
        baseRadius: isActive ? 3.0 : 2.0,
        color,
        opacity: isActive ? 0.95 : 0.4,
        baseOpacity: isActive ? 0.95 : 0.4,
        mass: 0.8,
        stiffness: 0.22,
        damping: 0.78,
        jitter: 0.1,
        shape: dotShape,
      });
    }
    dotsRef.current = dots;
  }, [segments, width, height, paddingX, spacing, centerY, palette, dotShape, activeSegments, inkColor]);

  // Update dots on value change with cascade / bleed animation
  useEffect(() => {
    const dots = dotsRef.current;
    for (let i = 0; i < dots.length; i++) {
      const isActive = i < activeSegments;
      dots[i].color = isActive ? (inkColor || (i === activeSegments - 1 ? palette.secondary : palette.primary)) : palette.muted;
      dots[i].opacity = isActive ? 0.95 : 0.4;
      dots[i].baseRadius = isActive ? 3.2 : 2.0;

      if (animationType === 'domino-cascade' && isActive) {
        dots[i].vy = -3 - (i % 3) * 1.5; // Domino jump
      } else if (animationType === 'capillary-bleed' && i === activeSegments - 1) {
        dots[i].radius = 4.5; // Lead dot ink bleed
      }
    }
  }, [activeSegments, palette, animationType, inkColor]);

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
      ctx.fillRect(0, 0, width, height);

      // Strobe pulse wave across completed dots
      if (animationType === 'strobe-pulse') {
        const wavePos = (frameCountRef.current * 0.08) % activeSegments;
        for (let i = 0; i < activeSegments; i++) {
          const dist = Math.abs(i - wavePos);
          if (dist < 1.8 && dotsRef.current[i]) {
            dotsRef.current[i].radius = 3.8;
          } else if (dotsRef.current[i]) {
            dotsRef.current[i].radius = dotsRef.current[i].baseRadius;
          }
        }
      }

      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: 0.22,
        damping: 0.78,
        mass: 0.8,
      }, 1, animationType);

      // Background track slot
      ctx.beginPath();
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1;
      ctx.moveTo(paddingX, centerY);
      ctx.lineTo(width - paddingX, centerY);
      ctx.stroke();

      // Render dots
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
  }, [width, height, palette, paddingX, centerY, dotShape, animationType, activeSegments]);

  return (
    <div className={`flex flex-col gap-1.5 select-none ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center px-1 text-xs font-mono font-extrabold uppercase tracking-wider" style={{ color: palette.dark }}>
          {label && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: inkColor || palette.primary }} />
              {label}
            </span>
          )}
          {showPercent && (
            <span
              className="text-xs font-mono font-bold"
              style={{ color: palette.muted }}
            >
              {clampedVal}%
            </span>
          )}
        </div>
      )}
      <div className="relative" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-lg shadow-2xs"
        />
      </div>
    </div>
  );
};
