import React, { useEffect, useRef } from 'react';
import type { Dot, PointerState, RisographPalette } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  palette?: RisographPalette;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
}

export const PaperDotToggle: React.FC<PaperDotToggleProps> = ({
  checked,
  onChange,
  palette = DEFAULT_PALETTE,
  width = 72,
  height = 36,
  label,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const borderDotsRef = useRef<Dot[]>([]);
  const knobDotsRef = useRef<Dot[]>([]);
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
    radius: 20,
  });

  const radius = height / 2;
  const targetX = checked ? width - radius : radius;
  const centerY = height / 2;

  // Initialize pill border dots & knob dots
  useEffect(() => {
    // 1. Pill border dots
    const borderDots: Dot[] = [];
    const numPillDots = 28;
    for (let i = 0; i < numPillDots; i++) {
      const angle = (i / numPillDots) * Math.PI * 2;
      let x = 0;
      let y = centerY + Math.sin(angle) * (radius - 3);

      if (Math.cos(angle) > 0) {
        x = width - radius + Math.cos(angle) * (radius - 3);
      } else {
        x = radius + Math.cos(angle) * (radius - 3);
      }

      borderDots.push({
        id: `pill-${i}`,
        x,
        y,
        targetX: x,
        targetY: y,
        vx: 0,
        vy: 0,
        radius: 1.8,
        baseRadius: 1.8,
        color: palette.muted,
        opacity: 0.6,
        baseOpacity: 0.6,
        mass: 1.0,
        stiffness: 0.18,
        damping: 0.8,
        jitter: 0.1,
      });
    }
    borderDotsRef.current = borderDots;

    // 2. Knob dots cluster
    const knobDots: Dot[] = [];
    const numKnobDots = 18;
    const knobR = radius - 5;
    const phi = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numKnobDots; i++) {
      const r = Math.sqrt(i / numKnobDots) * knobR;
      const theta = i * 2 * Math.PI * phi;
      const relX = r * Math.cos(theta);
      const relY = r * Math.sin(theta);

      knobDots.push({
        id: `knob-${i}`,
        x: targetX + relX,
        y: centerY + relY,
        targetX: targetX + relX,
        targetY: centerY + relY,
        vx: 0,
        vy: 0,
        radius: i === 0 ? 3.0 : 2.0,
        baseRadius: i === 0 ? 3.0 : 2.0,
        color: checked ? palette.secondary : palette.dark,
        opacity: 0.95,
        baseOpacity: 0.95,
        mass: 0.7,
        stiffness: 0.28,
        damping: 0.72,
        jitter: 0.15,
      });
    }
    knobDotsRef.current = knobDots;
  }, [width, height, radius, centerY, palette]);

  // Update knob position and colors on checked state change
  useEffect(() => {
    const knobDots = knobDotsRef.current;
    const knobR = radius - 5;
    const phi = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < knobDots.length; i++) {
      const r = Math.sqrt(i / knobDots.length) * knobR;
      const theta = i * 2 * Math.PI * phi;
      knobDots[i].targetX = targetX + r * Math.cos(theta);
      knobDots[i].targetY = centerY + r * Math.sin(theta);
      knobDots[i].color = checked ? palette.secondary : palette.dark;
    }

    // Border tint
    const border = borderDotsRef.current;
    for (let b = 0; b < border.length; b++) {
      border[b].color = checked ? palette.primary : palette.muted;
      border[b].opacity = checked ? 0.9 : 0.6;
    }
  }, [checked, targetX, centerY, radius, palette]);

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
      ctx.fillRect(0, 0, width, height);

      DotPhysicsEngine.updateDots(borderDotsRef.current, pointerRef.current, {
        stiffness: 0.18,
        damping: 0.8,
        mass: 1.0,
      });

      DotPhysicsEngine.updateDots(knobDotsRef.current, pointerRef.current, {
        stiffness: 0.28,
        damping: 0.72,
        mass: 0.7,
      });

      // Draw border dots
      const border = borderDotsRef.current;
      for (let i = 0; i < border.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          border[i].x,
          border[i].y,
          border[i].radius,
          border[i].color,
          border[i].opacity,
          false
        );
      }

      // Draw knob dots
      const knob = knobDotsRef.current;
      for (let i = 0; i < knob.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          knob[i].x,
          knob[i].y,
          knob[i].radius,
          knob[i].color,
          knob[i].opacity,
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
  }, [width, height, palette]);

  const toggle = () => {
    // Impart velocity kick
    DotPhysicsEngine.triggerScatter(
      knobDotsRef.current,
      targetX,
      centerY,
      8
    );
    onChange(!checked);
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none cursor-pointer ${className}`}
      onClick={toggle}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}
    >
      <div className="relative" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-full shadow-inner"
        />
      </div>
      {label && (
        <span
          className="text-sm font-mono font-semibold"
          style={{ color: palette.dark }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
