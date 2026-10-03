import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { ShapeGenerator } from '../shapes';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotCheckboxProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  inkColor?: string;
  size?: number;
  className?: string;
}

export const PaperDotCheckbox: React.FC<PaperDotCheckboxProps> = ({
  checked,
  onChange,
  label,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  inkColor,
  size = 28,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const borderDotsRef = useRef<Dot[]>([]);
  const checkDotsRef = useRef<Dot[]>([]);
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

  const activeColor = inkColor || palette.primary;

  // Initialize perimeter rounded square dots
  useEffect(() => {
    const pts = ShapeGenerator.generateRoundedRect(3, 3, size - 6, size - 6, 4, 3.5);
    const borderDots: Dot[] = [];

    for (let i = 0; i < pts.length; i++) {
      borderDots.push({
        id: `chk-b-${i}`,
        x: pts[i].x,
        y: pts[i].y,
        targetX: pts[i].x,
        targetY: pts[i].y,
        vx: 0,
        vy: 0,
        radius: 1.8,
        baseRadius: 1.8,
        color: checked ? activeColor : palette.muted,
        opacity: checked ? 0.95 : 0.6,
        baseOpacity: checked ? 0.95 : 0.6,
        mass: 0.9,
        stiffness: 0.22,
        damping: 0.80,
        jitter: 0.08,
        shape: dotShape,
      });
    }

    borderDotsRef.current = borderDots;

    // Checkmark interior dots (✓ shape: 5 dots)
    const checkCoords = [
      { x: size * 0.28, y: size * 0.52 },
      { x: size * 0.40, y: size * 0.66 },
      { x: size * 0.54, y: size * 0.50 },
      { x: size * 0.68, y: size * 0.36 },
      { x: size * 0.78, y: size * 0.24 },
    ];

    const checkDots: Dot[] = [];
    for (let i = 0; i < checkCoords.length; i++) {
      checkDots.push({
        id: `chk-c-${i}`,
        x: checkCoords[i].x,
        y: checkCoords[i].y,
        targetX: checkCoords[i].x,
        targetY: checkCoords[i].y,
        vx: 0,
        vy: 0,
        radius: checked ? 2.5 : 0.1,
        baseRadius: 2.5,
        color: activeColor,
        opacity: checked ? 1.0 : 0.0,
        baseOpacity: 1.0,
        mass: 0.7,
        stiffness: 0.28,
        damping: 0.76,
        jitter: 0.08,
        shape: dotShape,
      });
    }

    checkDotsRef.current = checkDots;
  }, [size, palette, dotShape, activeColor]);

  // Update check dots when checked state flips
  useEffect(() => {
    const border = borderDotsRef.current;
    for (let i = 0; i < border.length; i++) {
      border[i].color = checked ? activeColor : palette.muted;
      border[i].opacity = checked ? 0.95 : 0.6;
    }

    const check = checkDotsRef.current;
    for (let i = 0; i < check.length; i++) {
      if (checked) {
        check[i].radius = 0.5;
        check[i].opacity = 1.0;
        check[i].vy = -2 - i * 0.5; // subtle staggered blossom pop
      } else {
        check[i].radius = 0.1;
        check[i].opacity = 0.0;
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

      // Physics update for border and check dots
      DotPhysicsEngine.updateDots(
        borderDotsRef.current,
        pointerRef.current,
        { stiffness: 0.22, damping: 0.80, mass: 1.0 },
        1,
        'glow-fade'
      );

      DotPhysicsEngine.updateDots(
        checkDotsRef.current,
        pointerRef.current,
        { stiffness: 0.30, damping: 0.74, mass: 0.7 },
        1,
        'glow-fade'
      );

      // Render border dots
      const border = borderDotsRef.current;
      for (let i = 0; i < border.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          border[i].x,
          border[i].y,
          border[i].radius,
          border[i].color,
          border[i].opacity,
          false,
          border[i].shape || dotShape
        );
      }

      // Render checkmark dots if active
      const check = checkDotsRef.current;
      for (let i = 0; i < check.length; i++) {
        if (check[i].opacity > 0.05) {
          PaperTextureGenerator.drawInkDot(
            ctx,
            check[i].x,
            check[i].y,
            check[i].radius,
            check[i].color,
            check[i].opacity,
            true,
            check[i].shape || dotShape
          );
        }
      }

      // Connecting check stroke in risograph ink
      if (checked) {
        ctx.beginPath();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < check.length; i++) {
          if (i === 0) ctx.moveTo(check[i].x, check[i].y);
          else ctx.lineTo(check[i].x, check[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, palette, dotShape, activeColor, checked]);

  const toggle = () => {
    TactileAudio.playClick(checked ? 580 : 820);
    DotPhysicsEngine.triggerHydraulicPop(borderDotsRef.current, size / 2, size / 2, 7);
    onChange(!checked);
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
      onClick={toggle}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <div className="relative shrink-0 rounded-lg overflow-hidden shadow-2xs group-hover:shadow-xs transition-shadow" style={{ width: size, height: size }}>
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
