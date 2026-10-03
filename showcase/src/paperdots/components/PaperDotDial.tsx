import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, DialAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotDialProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (val: number) => void;
  label?: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: DialAnimationType;
  inkColor?: string;
  size?: number;
  className?: string;
}

export const PaperDotDial: React.FC<PaperDotDialProps> = ({
  value: controlledValue,
  defaultValue = 65,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label = 'Level',
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'radial-sweep',
  inkColor,
  size = 110,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValRef = useRef(currentValue);
  const lastDetentRef = useRef(currentValue);

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

  const activePrimary = inkColor || palette.primary;
  const center = size / 2;
  const radius = size * 0.38;

  // Arc configuration: from -135deg (135deg from top) to +135deg (total 270 deg span)
  const START_ANGLE = (135 * Math.PI) / 180;
  const END_ANGLE = (405 * Math.PI) / 180;
  const TOTAL_SPAN = END_ANGLE - START_ANGLE;

  const fraction = Math.min(1, Math.max(0, (currentValue - min) / (max - min)));
  const currentAngle = START_ANGLE + fraction * TOTAL_SPAN;

  // Generate radial dot lattice
  useEffect(() => {
    const dots: Dot[] = [];
    const tickCount = 22;

    for (let i = 0; i < tickCount; i++) {
      const tickFraction = i / (tickCount - 1);
      const angle = START_ANGLE + tickFraction * TOTAL_SPAN;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      const isPassed = tickFraction <= fraction + 0.02;

      dots.push({
        id: `dial-tick-${i}`,
        x,
        y,
        targetX: x,
        targetY: y,
        vx: 0,
        vy: 0,
        radius: isPassed ? 2.4 : 1.6,
        baseRadius: isPassed ? 2.4 : 1.6,
        color: isPassed ? activePrimary : (palette.border || '#D8D4C7'),
        opacity: isPassed ? 0.95 : 0.4,
        baseOpacity: isPassed ? 0.95 : 0.4,
        mass: 1.0,
        stiffness: 0.25,
        damping: 0.8,
        jitter: 0.05,
        shape: dotShape,
      });
    }

    // Indicator center needle dot
    const needleDist = radius * 0.65;
    const needleX = center + Math.cos(currentAngle) * needleDist;
    const needleY = center + Math.sin(currentAngle) * needleDist;
    dots.push({
      id: 'dial-needle',
      x: needleX,
      y: needleY,
      targetX: needleX,
      targetY: needleY,
      vx: 0,
      vy: 0,
      radius: 3.2,
      baseRadius: 3.2,
      color: activePrimary,
      opacity: 1.0,
      baseOpacity: 1.0,
      mass: 0.8,
      stiffness: 0.35,
      damping: 0.72,
      jitter: 0.0,
      shape: dotShape,
    });

    dotsRef.current = dots;
  }, [center, radius, fraction, activePrimary, palette, dotShape, currentAngle]);

  // Animation render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, size, size);

      // Inner disc face
      ctx.fillStyle = palette.cardBg || '#F5F2EB';
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = palette.border || '#D8D4C7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Apply physics to dots with distinct hover dynamics
      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: animationType === 'elastic-snap' ? 0.35 : 0.25,
        damping: animationType === 'elastic-snap' ? 0.72 : 0.80,
        mass: 1.0,
      }, 1, animationType);

      // Render dots
      dotsRef.current.forEach((dot) => {
        PaperTextureGenerator.drawInkDot(ctx, dot.x, dot.y, dot.radius, dot.color, dot.opacity, true, dot.shape);
      });

      // Center value readout plate
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.roundRect(center - 18, center - 11, 36, 22, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = palette.dark;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(currentValue)}`, center, center);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, center, radius, currentValue, palette, animationType]);

  const updateValueFromDelta = useCallback((deltaY: number) => {
    const range = max - min;
    const sensitivity = range / 140; // 140px vertical drag for full scale
    const newVal = Math.min(max, Math.max(min, Math.round((startValRef.current - deltaY * sensitivity) / step) * step));
    
    if (newVal !== currentValue) {
      if (Math.abs(newVal - lastDetentRef.current) >= Math.max(1, range / 20)) {
        TactileAudio.playClick(900 + (newVal / max) * 400);
        lastDetentRef.current = newVal;
      }
      setInternalValue(newVal);
      onChange?.(newVal);
    }
  }, [min, max, step, currentValue, onChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValRef.current = currentValue;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;

    if (isDraggingRef.current) {
      const deltaY = e.clientY - startYRef.current;
      updateValueFromDelta(deltaY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      pointerRef.current.isInside = false;
    }
  };

  return (
    <div
      className={`inline-flex flex-col items-center select-none cursor-ns-resize ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block"
      />
      {label && (
        <span
          className="text-[10px] font-mono font-extrabold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded shadow-2xs border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.90)',
            color: palette.dark,
            borderColor: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
