import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, ToggleAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: ToggleAnimationType;
  inkColor?: string;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
}

export const PaperDotToggle: React.FC<PaperDotToggleProps> = ({
  checked,
  onChange,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'cylinder-roll',
  inkColor,
  width = 72,
  height = 36,
  label,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const borderDotsRef = useRef<Dot[]>([]);
  const knobDotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 28,
  });

  const radius = height / 2;
  const targetX = checked ? width - radius : radius;
  const centerY = height / 2;

  // Initialize pill border dots & knob dots (once on dimension/palette changes)
  useEffect(() => {
    // 1. Pill border dots
    const borderDots: Dot[] = [];
    const numPillDots = 28;
    for (let i = 0; i < numPillDots; i++) {
      const angle = (i / numPillDots) * Math.PI * 2;
      let x = 0;
      const y = centerY + Math.sin(angle) * (radius - 3);

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
        radius: 2.2,
        baseRadius: 2.2,
        color: checked ? (inkColor || palette.primary) : palette.muted,
        opacity: checked ? 0.9 : 0.6,
        baseOpacity: 0.6,
        mass: 1.0,
        stiffness: 0.22,
        damping: 0.80,
        jitter: 0.08,
        shape: dotShape,
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
        radius: i === 0 ? 3.5 : 2.4,
        baseRadius: i === 0 ? 3.5 : 2.4,
        color: checked ? (inkColor || palette.secondary) : palette.dark,
        opacity: 0.95,
        baseOpacity: 0.95,
        mass: 0.7,
        stiffness: 0.20,
        damping: 0.82,
        jitter: 0.08,
        shape: dotShape,
      });
    }
    knobDotsRef.current = knobDots;
  }, [width, height, radius, centerY, palette, dotShape, inkColor]);

  // Smoothly glide knob position and update colors when checked state changes
  useEffect(() => {
    const knobDots = knobDotsRef.current;
    if (!knobDots || knobDots.length === 0) return;
    const knobR = radius - 5;
    const phi = (1 + Math.sqrt(5)) / 2;
    const dir = checked ? 1 : -1;

    for (let i = 0; i < knobDots.length; i++) {
      const r = Math.sqrt(i / knobDots.length) * knobR;
      const theta = i * 2 * Math.PI * phi;
      knobDots[i].targetX = targetX + r * Math.cos(theta);
      knobDots[i].targetY = centerY + r * Math.sin(theta);
      // Impart smooth glide velocity in switch direction
      knobDots[i].vx = dir * 7 + (Math.random() - 0.5) * 2;
      knobDots[i].color = checked ? (inkColor || palette.secondary) : palette.dark;
    }

    // Border tint
    const border = borderDotsRef.current;
    for (let b = 0; b < border.length; b++) {
      border[b].color = checked ? (inkColor || palette.primary) : palette.muted;
      border[b].opacity = checked ? 0.9 : 0.6;
    }
  }, [checked, targetX, centerY, radius, inkColor, palette]);

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
        stiffness: 0.22,
        damping: 0.80,
        mass: 1.0,
      }, 1, 'glow-fade');

      DotPhysicsEngine.updateDots(knobDotsRef.current, pointerRef.current, {
        stiffness: 0.28,
        damping: 0.78,
        mass: 0.7,
      }, 1, 'glow-fade');

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
          false,
          border[i].shape || dotShape
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
          true,
          knob[i].shape || dotShape
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, palette, dotShape]);

  const toggle = () => {
    TactileAudio.playClick(checked ? 550 : 750);

    // Impart continuous smooth switch kinematics
    const dir = checked ? -1 : 1;
    if (animationType === 'cylinder-roll') {
      for (let i = 0; i < knobDotsRef.current.length; i++) {
        const d = knobDotsRef.current[i];
        d.vx = dir * 9;
        d.vy = (Math.random() - 0.5) * 2;
      }
    } else if (animationType === 'page-flip') {
      for (let i = 0; i < knobDotsRef.current.length; i++) {
        const d = knobDotsRef.current[i];
        d.vx = dir * 8;
        d.vy = -3.5 + (Math.random() - 0.5) * 1.5; // gentle upward arc
      }
    } else if (animationType === 'slingshot-snap') {
      for (let i = 0; i < knobDotsRef.current.length; i++) {
        const d = knobDotsRef.current[i];
        d.vx = dir * 12; // snappy spring release
      }
    } else {
      for (let i = 0; i < knobDotsRef.current.length; i++) {
        const d = knobDotsRef.current[i];
        d.vx = dir * 8;
      }
    }

    onChange(!checked);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;
  };

  const handlePointerEnter = () => {
    pointerRef.current.isInside = true;
    setIsHovered(true);
    TactileAudio.playTick();
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
    setIsHovered(false);
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${className}`}
      onClick={toggle}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      style={{
        transform: isHovered ? 'scale(1.02)' : 'none',
        transition: 'transform 0.15s ease',
      }}
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
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: palette.dark }}
          >
            {label}
          </span>
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-widest"
            style={{ color: checked ? (palette.secondary || '#00805A') : palette.muted }}
          >
            {checked ? 'ON' : 'OFF'}
          </span>
        </div>
      )}
    </div>
  );
};
