import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotRadioProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  inkColor?: string;
  size?: number;
  className?: string;
}

export const PaperDotRadio: React.FC<PaperDotRadioProps> = ({
  checked,
  onChange,
  label,
  palette = DEFAULT_PALETTE,
  dotShape = 'circle',
  inkColor,
  size = 28,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringDotsRef = useRef<Dot[]>([]);
  const centerDotRef = useRef<Dot[]>([]);
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
    radius: 18,
  });

  const center = size / 2;
  const ringRadius = size * 0.38;
  const activeColor = inkColor || palette.primary;

  // Initialize perimeter ring dots and center indicator dot
  useEffect(() => {
    const ringDots: Dot[] = [];
    const numRingDots = 20;

    for (let i = 0; i < numRingDots; i++) {
      const angle = (i / numRingDots) * Math.PI * 2;
      const x = center + Math.cos(angle) * ringRadius;
      const y = center + Math.sin(angle) * ringRadius;

      ringDots.push({
        id: `rad-r-${i}`,
        x,
        y,
        targetX: x,
        targetY: y,
        vx: 0,
        vy: 0,
        radius: 1.8,
        baseRadius: 1.8,
        color: checked ? activeColor : palette.muted,
        opacity: checked ? 0.95 : 0.6,
        baseOpacity: 0.6,
        mass: 0.9,
        stiffness: 0.22,
        damping: 0.80,
        jitter: 0.08,
        shape: dotShape,
      });
    }
    ringDotsRef.current = ringDots;

    // Center indicator dot
    centerDotRef.current = [
      {
        id: 'rad-c',
        x: center,
        y: center,
        targetX: center,
        targetY: center,
        vx: 0,
        vy: 0,
        radius: checked ? 4.5 : 0.1,
        baseRadius: 4.5,
        color: activeColor,
        opacity: checked ? 1.0 : 0.0,
        baseOpacity: 1.0,
        mass: 0.6,
        stiffness: 0.32,
        damping: 0.72,
        jitter: 0.06,
        shape: dotShape,
      },
    ];
  }, [size, center, ringRadius, palette, dotShape, activeColor]);

  // Update dots on checked state change
  useEffect(() => {
    const ring = ringDotsRef.current;
    for (let i = 0; i < ring.length; i++) {
      ring[i].color = checked ? activeColor : palette.muted;
      ring[i].opacity = checked ? 0.95 : 0.6;
    }

    const c = centerDotRef.current[0];
    if (c) {
      if (checked) {
        c.radius = 1.0;
        c.opacity = 1.0;
        c.vx = (Math.random() - 0.5) * 4;
        c.vy = (Math.random() - 0.5) * 4;
      } else {
        c.radius = 0.1;
        c.opacity = 0.0;
      }
    }
  }, [checked, activeColor, palette]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.fillStyle = palette.cardBg || palette.background;
      ctx.fillRect(0, 0, size, size);

      DotPhysicsEngine.updateDots(
        ringDotsRef.current,
        pointerRef.current,
        { stiffness: 0.22, damping: 0.80, mass: 1.0 },
        1,
        'glow-fade'
      );

      DotPhysicsEngine.updateDots(
        centerDotRef.current,
        pointerRef.current,
        { stiffness: 0.32, damping: 0.72, mass: 0.6 },
        1,
        'glow-fade'
      );

      // Draw ring dots
      const ring = ringDotsRef.current;
      for (let i = 0; i < ring.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          ring[i].x,
          ring[i].y,
          ring[i].radius,
          ring[i].color,
          ring[i].opacity,
          false,
          ring[i].shape || dotShape
        );
      }

      // Draw center dot if active
      const c = centerDotRef.current[0];
      if (c && c.opacity > 0.05) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          c.x,
          c.y,
          c.radius,
          c.color,
          c.opacity,
          true,
          c.shape || dotShape
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette, dotShape, activeColor, checked]);

  const select = () => {
    if (!checked) {
      TactileAudio.playClick(880);
      DotPhysicsEngine.triggerHydraulicPop(ringDotsRef.current, center, center, 8);
      onChange();
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
      onClick={select}
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          select();
        }
      }}
    >
      <div className="relative shrink-0 rounded-full overflow-hidden shadow-2xs group-hover:shadow-xs transition-shadow" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block"
        />
      </div>
      {label && (
        <span
          className="text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          style={{ color: checked ? palette.dark : palette.muted }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
