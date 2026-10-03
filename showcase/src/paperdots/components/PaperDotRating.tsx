import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, RatingAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { ShapeGenerator } from '../shapes';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotRatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  onChange?: (val: number) => void;
  shape?: 'star' | 'heart';
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: RatingAnimationType;
  inkColor?: string;
  size?: number; // size per star/heart
  className?: string;
}

export const PaperDotRating: React.FC<PaperDotRatingProps> = ({
  value: controlledValue,
  defaultValue = 4,
  max = 5,
  onChange,
  shape = 'star',
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'bloom-expand',
  inkColor,
  size = 36,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const displayValue = hoverValue !== null ? hoverValue : currentValue;

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

  const width = size * max;
  const height = size;
  const activePrimary = inkColor || (shape === 'heart' ? '#FF48B0' : '#FFD800'); // Sunflower yellow for stars, Pink for hearts

  // Generate constellation dots for each rating slot
  useEffect(() => {
    const dots: Dot[] = [];
    const dotsPerItem = 18;

    for (let i = 0; i < max; i++) {
      const cx = i * size + size / 2;
      const cy = size / 2;
      const radius = size * 0.36;

      const points = ShapeGenerator.getShapePoints(shape, cx, cy, radius, dotsPerItem);

      points.forEach((pt, pIdx) => {
        const isFilled = i < displayValue;
        dots.push({
          id: `rating-dot-${i}-${pIdx}`,
          x: pt.x,
          y: pt.y,
          targetX: pt.x,
          targetY: pt.y,
          vx: 0,
          vy: 0,
          radius: isFilled ? 2.4 : 1.6,
          baseRadius: isFilled ? 2.4 : 1.6,
          color: isFilled ? activePrimary : (palette.border || '#D8D4C7'),
          opacity: isFilled ? 0.95 : 0.45,
          baseOpacity: isFilled ? 0.95 : 0.45,
          mass: 1.0 + Math.random() * 0.2,
          stiffness: 0.25,
          damping: 0.78,
          jitter: 0.08,
          shape: dotShape,
          phaseOffset: (i * 0.5) + (pIdx * 0.1),
        });
      });
    }

    dotsRef.current = dots;
  }, [max, size, shape, displayValue, dotShape, activePrimary, palette]);

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      frameCountRef.current++;
      const time = frameCountRef.current * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Micro bloom/pulse effect on active dots
      dotsRef.current.forEach((dot) => {
        if (dot.baseOpacity > 0.6) {
          if (animationType === 'smooth-pulse') {
            const pulse = Math.sin(time + (dot.phaseOffset || 0)) * 0.4;
            dot.radius = Math.max(1.8, dot.baseRadius + pulse);
          } else if (animationType === 'bloom-expand' && hoverValue !== null) {
            dot.radius = dot.baseRadius * 1.15;
          }
        }
      });

      // Apply physics with distinct hover dynamics
      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: 0.25,
        damping: 0.78,
        mass: 1.0,
      }, 1, animationType);

      // Render dots
      dotsRef.current.forEach((dot) => {
        PaperTextureGenerator.drawInkDot(ctx, dot.x, dot.y, dot.radius, dot.color, dot.opacity, true, dot.shape);
      });

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, animationType, hoverValue]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    pointerRef.current.x = x;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;

    const hovered = Math.min(max, Math.max(1, Math.ceil((x / width) * max)));
    if (hovered !== hoverValue) {
      setHoverValue(hovered);
    }
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
    setHoverValue(null);
  };

  const handleClick = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clicked = Math.min(max, Math.max(1, Math.ceil((x / width) * max)));
    setInternalValue(clicked);
    onChange?.(clicked);

    // Harmonic pitch ascending per star
    const baseFreq = shape === 'heart' ? 700 : 800;
    TactileAudio.playClick(baseFreq + clicked * 75);
  };

  return (
    <div
      className={`relative inline-flex items-center gap-3 select-none cursor-pointer py-1 ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handleClick}
      title={`${displayValue} of ${max} ${shape}s`}
    >
      <div style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
        />
      </div>
      <span
        className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold uppercase shadow-2xs border whitespace-nowrap"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.90)',
          color: palette.dark,
          borderColor: 'rgba(0, 0, 0, 0.12)',
        }}
      >
        {displayValue}/{max} {shape.toUpperCase()}S
      </span>
    </div>
  );
};
